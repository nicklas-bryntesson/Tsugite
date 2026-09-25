// Port of AiPoc ClientApp/js/utils/CoverCompositionVideo.ts (verbatim)

// ── Ambient declarations (from AiPoc ClientApp/types/global.d.ts) ─────────────
declare global {
  /**
   * Network Information API — not part of the standard DOM lib types.
   * Used by CoverCompositionVideo to gate autoplay on connection quality.
   */
  interface NetworkInformation extends EventTarget {
    readonly effectiveType?: string;
    readonly saveData?: boolean;
  }

  interface Navigator {
    readonly connection?: NetworkInformation;
    readonly mozConnection?: NetworkInformation;
  }

  interface Element {
    /** Per-element instance pointer set by CoverCompositionVideo.attach(). */
    __coverInstance?: CoverCompositionVideo;
  }
}

type VideoState =
  | "idle"
  | "ready"
  | "playing"
  | "pausedByUser"
  | "pausedByPolicy"
  | "blocked"
  | "error";

type VideoEvent =
  | "INIT"
  | "CANPLAY"
  | "PLAY"
  | "PAUSE"
  | "PLAY_REJECTED"
  | "POLICY_CHANGE"
  | "ERROR";

interface PauseDetail {
  byUser?: boolean;
  byPolicy?: boolean;
}

interface PolicyBlockers {
  autoplayDisabled: boolean;
  reducedMotion: boolean;
  notVisible: boolean;
  saveData: boolean;
  slowConnection: boolean;
}

export default class CoverCompositionVideo {
  static instanceCount = 0;

  root: HTMLElement;
  mediaContainer: HTMLElement | null;
  video: HTMLVideoElement | null;
  state: VideoState;
  userPaused: boolean;
  policyPaused: boolean;
  isVisible: boolean;
  hasAttached: boolean;
  userHasStartedPlayback: boolean;
  userReducedMotionOverride: boolean;
  intersectionObserver: IntersectionObserver | null;
  reducedMotionQuery: MediaQueryList | null;
  connection: NetworkInformation | null;
  controls: HTMLDivElement | null;
  controlButton: HTMLButtonElement | null;
  controlIconPath: SVGPathElement | null;
  pendingPauseDetail: PauseDetail | null;
  playLabel: string;
  pauseLabel: string;

  constructor(componentElement: HTMLElement) {
    this.root = componentElement;
    this.mediaContainer = this.root.querySelector<HTMLElement>(".media-container");
    this.video = this.root.querySelector("video");
    this.state = "idle";
    this.userPaused = false;
    this.policyPaused = false;
    this.isVisible = false;
    this.hasAttached = false;
    this.userHasStartedPlayback = false;
    this.userReducedMotionOverride = false;
    this.intersectionObserver = null;
    this.reducedMotionQuery = null;
    this.connection = null;
    this.controls = null;
    this.controlButton = null;
    this.controlIconPath = null;
    this.pendingPauseDetail = null;
    this.playLabel = this.root.dataset.playText || "Play video";
    this.pauseLabel = this.root.dataset.pauseText || "Pause video";

    this.handleReducedMotionChange = this.handleReducedMotionChange.bind(this);
    this.handleConnectionChange = this.handleConnectionChange.bind(this);
    this.handleVisibilityEntries = this.handleVisibilityEntries.bind(this);
    this.handleCanPlay = this.handleCanPlay.bind(this);
    this.handleVideoError = this.handleVideoError.bind(this);
    this.handleVideoPlay = this.handleVideoPlay.bind(this);
    this.handleVideoPause = this.handleVideoPause.bind(this);
    this.handleControlToggle = this.handleControlToggle.bind(this);

    this.init();
  }

  static attach(parent: Document | Element = document): void {
    const elements = parent.querySelectorAll('[data-component="CoverCompositionVideo"]');

    elements.forEach((element) => {
      if (element.__coverInstance) return;
      element.__coverInstance = new CoverCompositionVideo(element as HTMLElement);
    });
  }

  init(): void {
    if (!this.video) return;

    this.hasAttached = true;
    this.setupVideoElement();
    this.setupControls();
    this.setupPolicySignals();
    this.setupVideoEvents();
    this.transition("INIT");
  }

  setupVideoElement(): void {
    if (!this.video) return;
    this.video.controls = false;
    this.video.setAttribute("playsinline", "");
    this.video.setAttribute("preload", "metadata");
    this.ensureVideoId();
  }

  setupControls(): void {
    if (!this.mediaContainer) return;

    this.controls = document.createElement("div");
    this.controls.className = "video-controls";

    this.controlButton = document.createElement("button");
    this.controlButton.type = "button";
    this.controlButton.className = "video-toggle";
    this.controlButton.setAttribute("aria-label", this.playLabel);

    if (this.video?.id) {
      this.controlButton.setAttribute("aria-controls", this.video.id);
    }

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "currentColor");

    this.controlIconPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    svg.appendChild(this.controlIconPath);

    this.controlButton.appendChild(svg);
    this.controls.appendChild(this.controlButton);
    this.mediaContainer.prepend(this.controls);
    this.controlButton.addEventListener("click", this.handleControlToggle);
    this.updateControlsUI();
  }

  setupPolicySignals(): void {
    this.reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.reducedMotionQuery.addEventListener("change", this.handleReducedMotionChange);

    this.connection = navigator.connection || navigator.mozConnection || null;
    if (this.connection?.addEventListener) {
      this.connection.addEventListener("change", this.handleConnectionChange);
    }

    if ("IntersectionObserver" in window) {
      this.intersectionObserver = new IntersectionObserver(
        this.handleVisibilityEntries,
        { threshold: 0.4 }
      );
      this.intersectionObserver.observe(this.root);
    } else {
      this.isVisible = true;
    }
  }

  setupVideoEvents(): void {
    if (!this.video) return;
    this.video.addEventListener("canplay", this.handleCanPlay);
    this.video.addEventListener("error", this.handleVideoError);
    this.video.addEventListener("play", this.handleVideoPlay);
    this.video.addEventListener("pause", this.handleVideoPause);
  }

  transition(eventName: VideoEvent, detail: PauseDetail = {}): void {
    this.state = this.getNextState(this.state, eventName, detail);
    this.root.setAttribute("data-video-state", this.state);
    this.updateControlsUI();
    this.syncMediaPolicy();
  }

  getNextState(currentState: VideoState, eventName: VideoEvent, detail: PauseDetail): VideoState {
    switch (eventName) {
      case "INIT":        return "idle";
      case "CANPLAY":     return currentState === "error" ? "error" : "ready";
      case "PLAY":        return "playing";
      case "PAUSE":
        if (detail.byPolicy) return "pausedByPolicy";
        if (detail.byUser)   return "pausedByUser";
        return currentState === "playing" ? "ready" : currentState;
      case "PLAY_REJECTED": return "blocked";
      case "POLICY_CHANGE": return currentState;
      case "ERROR":         return "error";
      default:              return currentState;
    }
  }

  syncMediaPolicy(): void {
    if (!this.video) return;

    const blockers = this.getPolicyBlockers();
    const shouldAutoplay = !Object.values(blockers).some(Boolean);

    if (shouldAutoplay && this.video.paused && !this.userPaused) {
      this.play({ byPolicy: true });
      return;
    }

    if (!shouldAutoplay && !this.video.paused) {
      const blockedOnlyByReducedMotion =
        blockers.reducedMotion &&
        !blockers.autoplayDisabled &&
        !blockers.notVisible &&
        !blockers.saveData &&
        !blockers.slowConnection;

      if (!(blockedOnlyByReducedMotion && this.userReducedMotionOverride)) {
        this.pause({ byPolicy: true });
      }
    }
  }

  async play(options: PauseDetail = {}): Promise<void> {
    if (!this.video) return;

    if (options.byUser) {
      this.userPaused = false;
      this.userHasStartedPlayback = true;
      this.userReducedMotionOverride = Boolean(this.reducedMotionQuery?.matches);
    }

    this.policyPaused = false;

    try {
      await this.video.play();
    } catch {
      this.transition("PLAY_REJECTED");
    }
  }

  pause(options: PauseDetail = {}): void {
    if (!this.video) return;

    const byUser   = Boolean(options.byUser);
    const byPolicy = Boolean(options.byPolicy);

    if (byUser) {
      this.userPaused = true;
      this.userHasStartedPlayback = false;
      this.userReducedMotionOverride = false;
    }

    this.policyPaused = byPolicy;
    this.pendingPauseDetail = { byUser, byPolicy };
    this.video.pause();
  }

  toggle(): void {
    if (!this.video) return;
    this.video.paused ? this.play({ byUser: true }) : this.pause({ byUser: true });
  }

  destroy(): void {
    if (!this.hasAttached || !this.video) return;

    this.video.removeEventListener("canplay", this.handleCanPlay);
    this.video.removeEventListener("error", this.handleVideoError);
    this.video.removeEventListener("play", this.handleVideoPlay);
    this.video.removeEventListener("pause", this.handleVideoPause);

    this.reducedMotionQuery?.removeEventListener("change", this.handleReducedMotionChange);

    if (this.connection?.removeEventListener) {
      this.connection.removeEventListener("change", this.handleConnectionChange);
    }

    this.intersectionObserver?.disconnect();
    this.controlButton?.removeEventListener("click", this.handleControlToggle);
    this.controls?.remove();

    delete this.root.__coverInstance;
    this.hasAttached = false;
  }

  handleReducedMotionChange(): void {
    this.userReducedMotionOverride = false;
    this.transition("POLICY_CHANGE");
  }

  handleConnectionChange(): void {
    this.transition("POLICY_CHANGE");
  }

  handleVisibilityEntries(entries: IntersectionObserverEntry[]): void {
    const entry = entries[0];
    if (!entry) return;
    this.isVisible = entry.isIntersecting && entry.intersectionRatio >= 0.4;
    this.transition("POLICY_CHANGE");
  }

  handleCanPlay(): void    { this.transition("CANPLAY"); }
  handleVideoError(): void { this.transition("ERROR"); }

  handleVideoPlay(): void {
    this.policyPaused = false;
    this.transition("PLAY");
  }

  handleVideoPause(): void {
    const pauseDetail = this.pendingPauseDetail || {
      byPolicy: this.policyPaused,
      byUser:   this.userPaused,
    };
    this.pendingPauseDetail = null;
    this.transition("PAUSE", pauseDetail);
  }

  handleControlToggle(event: Event): void {
    event.preventDefault();
    this.toggle();
  }

  updateControlsUI(): void {
    if (!this.controlButton || !this.controlIconPath) return;

    const isPlaying = this.video ? !this.video.paused : this.state === "playing";

    this.controlButton.setAttribute("aria-label", isPlaying ? this.pauseLabel : this.playLabel);
    this.controlButton.setAttribute("data-icon", isPlaying ? "pause" : "play");
    this.controlIconPath.setAttribute(
      "d",
      isPlaying ? "M6 4h4v16H6zm8 0h4v16h-4z" : "M8 5v14l11-7z"
    );
  }

  ensureVideoId(): void {
    if (!this.video || this.video.id) return;
    CoverCompositionVideo.instanceCount += 1;
    this.video.id = `cover-video-${CoverCompositionVideo.instanceCount}`;
  }

  getPolicyBlockers(): PolicyBlockers {
    const autoplayMode  = this.root.dataset.autoplay || "off";
    const effectiveType = this.connection?.effectiveType || "";

    return {
      autoplayDisabled: autoplayMode !== "policy",
      reducedMotion:    Boolean(this.reducedMotionQuery?.matches),
      notVisible:       !this.isVisible,
      saveData:         Boolean(this.connection?.saveData),
      slowConnection:   effectiveType === "slow-2g" || effectiveType === "2g",
    };
  }
}
