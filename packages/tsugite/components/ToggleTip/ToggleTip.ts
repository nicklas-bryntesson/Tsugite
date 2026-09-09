// ToggleTip, rail variant — behaviour only. The DOM end-state is authored in
// ToggleTip.astro; this class toggles the open state and anchors the bubble
// through kernel/js/popup-anchor (the first consumer of that module).
//
// Attach pattern shared with the field family: `ToggleTip.attach(parent)`
// hydrates every `[data-component="ToggleTip"]` once, guarded by an instance
// slot on the element, and marks the root `data-initialized="true"`.

import { layoutPopup, updateDirection, watchResize, lightDismiss } from '../../kernel/js/popup-anchor'
import type { DismissReason } from '../../kernel/js/popup-anchor'

declare global {
  interface HTMLElement {
    __toggleTipInstance?: ToggleTip
  }
}

// The tokens ToggleTip.astro declares on its root; popup-anchor writes the
// first two and reads the rest.
const TOKENS = {
  offset: '--_tt-popup-offset',
  arrow: '--_tt-arrow-offset',
  arrowSize: '--_tt-arrow-size',
  arrowRadius: '--_tt-border-radius',
  inset: '--_tt-site-padding',
}

class ToggleTip {
  private readonly root: HTMLElement
  private readonly trigger: HTMLButtonElement
  private readonly rail: HTMLElement
  private readonly popup: HTMLElement
  /** Lives as long as the instance — resize watching. */
  private readonly lifetime = new AbortController()
  /** Lives while the bubble is open — light dismiss. */
  private openAbort: AbortController | null = null

  static attach(parent: Document | HTMLElement = document): void {
    parent.querySelectorAll<HTMLElement>('[data-component="ToggleTip"]').forEach(el => {
      if (el.__toggleTipInstance) return
      el.__toggleTipInstance = new ToggleTip(el)
    })
  }

  constructor(root: HTMLElement) {
    this.root = root
    this.trigger = root.querySelector<HTMLButtonElement>('.trigger')!
    this.rail = root.querySelector<HTMLElement>('.rail')!
    this.popup = root.querySelector<HTMLElement>('.popup')!

    this.trigger.addEventListener('click', this.toggle, { signal: this.lifetime.signal })
    watchResize(this.handleResize, this.lifetime.signal)

    // The root is exactly the trigger's box, so it is the anchor measured.
    updateDirection(this.root, this.root)
    this.root.setAttribute('data-initialized', 'true')
  }

  get isOpen(): boolean {
    return this.popup.getAttribute('aria-hidden') === 'false'
  }

  open(): void {
    if (this.isOpen) return
    updateDirection(this.root, this.root)
    // display:block from here — the bubble has real dimensions to lay out.
    this.popup.setAttribute('aria-hidden', 'false')
    this.trigger.setAttribute('aria-expanded', 'true')
    layoutPopup({ root: this.root, trigger: this.root, rail: this.rail, popup: this.popup, tokens: TOKENS })

    this.openAbort = new AbortController()
    lightDismiss({
      root: this.root,
      pointer: 'mousedown',
      onDismiss: this.dismiss,
      signal: this.openAbort.signal,
    })
  }

  close(): void {
    if (!this.isOpen) return
    this.openAbort?.abort()
    this.openAbort = null
    this.popup.setAttribute('aria-hidden', 'true')
    this.trigger.setAttribute('aria-expanded', 'false')
  }

  private toggle = (): void => {
    if (this.isOpen) this.close()
    else this.open()
  }

  private dismiss = (reason: DismissReason): void => {
    this.close()
    // Keyboard close hands focus back; an outside click must not steal it
    // from what the user clicked, and focusout already moved it.
    if (reason === 'escape') this.trigger.focus()
  }

  private handleResize = (): void => {
    updateDirection(this.root, this.root)
    if (this.isOpen) {
      layoutPopup({ root: this.root, trigger: this.root, rail: this.rail, popup: this.popup, tokens: TOKENS })
    }
  }

  destroy(): void {
    this.close()
    this.lifetime.abort()
    delete this.root.__toggleTipInstance
  }
}

export default ToggleTip
