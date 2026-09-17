// Button — the recipe. Framework-free: resolves props to the element, the class and
// the attributes every renderer writes out verbatim (ADR-0017). Two kinds share it:
// a LINK (<a>, intent-neutral) and an ACTION (<button>, with intent). LinkButton.astro,
// ActionButton.astro and Button.tsx are its renderers.
import { escapeHtml } from "./html";

export const BUTTON_EMPHASIS = ["primary", "secondary", "tertiary"] as const;
export const BUTTON_INTENTS = ["neutral", "destructive", "success"] as const;
export const BUTTON_SIZES = ["sm", "md", "lg"] as const;
export const BUTTON_ICON_POSITIONS = ["left", "right"] as const;

export interface ButtonInput {
  kind: "link" | "action";
  /** link */
  href?: string | null;
  target?: string | null;
  /** action */
  buttonType?: string;
  disabled?: boolean;
  /** shared */
  emphasis?: string;
  intent?: string | null;
  pill?: boolean;
  growInline?: boolean;
  size?: string;
  icon?: string | null;
  iconPosition?: string;
  ariaLabel?: string | null;
  class?: string;
  /** whether the renderer has label content */
  hasText: boolean;
}

export interface ButtonResolution {
  mode: "render" | "suppress" | "error";
  errorMessage: string;
  tag: "a" | "button";
  className: string;
  /** in write order — renderers keep it, so every renderer emits the same markup */
  attrs: Record<string, string>;
  /** the sprite symbol to reference, if any */
  iconName: string | null;
  iconOnly: boolean;
  /** action only; a boolean attribute, written in each renderer's idiom */
  disabled: boolean;
}

export function resolveButton(input: ButtonInput): ButtonResolution {
  const emphasis = (input.emphasis ?? "primary").toLowerCase();
  const size = (input.size ?? "md").toLowerCase();
  const pill = input.pill ?? false;
  const growInline = input.growInline ?? false;
  const iconPosition = (input.iconPosition ?? "right").toLowerCase();
  const iconName = input.icon?.trim() || null;
  const hasAriaLabel = !!input.ariaLabel?.trim();
  const iconOnly = !!iconName && !input.hasText;

  let mode: ButtonResolution["mode"] = "render";
  let errorMessage = "";
  if (!input.hasText && !iconName && !hasAriaLabel) {
    mode = "suppress";
  } else if (iconOnly && growInline) {
    // Forbidden combination (ADR-0015): a square icon button never spans a row.
    mode = "error";
    errorMessage = "icon-only buttons cannot grow: growInline requires a label";
  }

  const tag: ButtonResolution["tag"] = input.kind === "link" ? "a" : "button";
  const attrs: Record<string, string> = {};

  if (tag === "a") {
    if (input.href) attrs.href = input.href;
    if (input.target) attrs.target = input.target;
    if (input.target === "_blank") attrs.rel = "noopener noreferrer";
  } else {
    attrs.type = input.buttonType ?? "button";
  }

  if ((BUTTON_EMPHASIS as readonly string[]).includes(emphasis)) attrs["data-emphasis"] = emphasis;
  // TODO(decide): an invalid intent or emphasis drops the attribute silently (the first
  // codebase's contract); Card raises a dev error for an invalid padding. Two policies.
  const intent = input.intent?.toLowerCase();
  if (tag === "button" && intent && (BUTTON_INTENTS as readonly string[]).includes(intent)) attrs["data-intent"] = intent;
  if ((BUTTON_SIZES as readonly string[]).includes(size)) attrs["data-size"] = size;
  attrs["data-pill"] = pill ? "true" : "false";
  attrs["data-grow-inline"] = growInline ? "true" : "false";
  if (iconName) {
    attrs["data-icon"] = iconName;
    if ((BUTTON_ICON_POSITIONS as readonly string[]).includes(iconPosition)) attrs["data-icon-position"] = iconPosition;
  }
  if (hasAriaLabel) attrs["aria-label"] = input.ariaLabel!.trim();
  if (iconOnly) attrs["data-icon-only"] = "true";

  return {
    mode,
    errorMessage,
    tag,
    className: input.class && String(input.class).trim() ? `Button ${input.class}` : "Button",
    attrs,
    iconName,
    iconOnly,
    disabled: tag === "button" && !!input.disabled,
  };
}

/** The icon part as an HTML string, for string-building renderers. */
export function buttonIconHtml(iconName: string): string {
  return `<svg class="Button-icon" aria-hidden="true" focusable="false"><use href="#${escapeHtml(iconName)}"></use></svg>`;
}
