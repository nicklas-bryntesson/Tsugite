// Popup anchoring shared by every rail-positioned popup (ToggleTip, the date
// fields' calendars and wheels).
//
// `popup-position.ts` owns the MATH (offset along the rail, arrow correction,
// above/below). This module owns the WIRING around it, which until now was
// copied into six components with only the token prefix changed:
//
//  1. Direction — measure the trigger, write `data-direction` on the root.
//  2. Layout — measure rail/popup/trigger, resolve the caller's tokens to px,
//     write the caller-named offset (%) and arrow (px) custom properties.
//  3. The px probe — resolve any custom property (rem, clamp, calc …) to
//     pixels by measuring a hidden element, since getComputedStyle returns
//     the authored string.
//  4. Resize — one rAF-throttled `resize` listener, torn down by a signal.
//  5. Light dismiss — outside pointer, focus leaving the root, Escape — each
//     reported with its reason so the caller decides whether to refocus.
//
// What stays per component: open/close state, what the popup contains, the
// focus trap for modal surfaces (`popup-interaction.ts`), and any keyboard
// handling that needs component state. Escape here is optional for exactly
// that reason — a component with its own keydown routing opts out.
//
// Every listener installed here is removed when the given AbortSignal aborts,
// mirroring WheelColumn and trapPopupInteraction.

import { calculatePopupOffset, calculateArrowOffset, detectDirection } from './popup-position'

export type PopupDirection = 'top' | 'bottom'

// ─── The px probe ────────────────────────────────────────────────────────────

/**
 * Resolve a custom property to pixels as the browser would compute it on
 * `host`: a hidden probe is appended, given `width: var(<property>, 0px)`,
 * measured, and removed. getBoundingClientRect forces synchronous layout, so
 * the value is always current. Returns 0 when the property is unset.
 */
export function readCssPx(host: HTMLElement, property: string): number {
  const probe = document.createElement('div')
  probe.style.cssText = `position:absolute;visibility:hidden;pointer-events:none;width:var(${property},0px)`
  host.appendChild(probe)
  const px = probe.getBoundingClientRect().width
  host.removeChild(probe)
  return px
}

// ─── Direction ───────────────────────────────────────────────────────────────

/**
 * Decide above/below from the trigger's position and write it to
 * `root[data-direction]` — only when it changes, so CSS transitions keyed on
 * the attribute do not restart on every resize. Returns the direction.
 */
export function updateDirection(root: HTMLElement, trigger: HTMLElement): PopupDirection {
  const direction = detectDirection(trigger.getBoundingClientRect())
  if (root.getAttribute('data-direction') !== direction) {
    root.setAttribute('data-direction', direction)
  }
  return direction
}

// ─── Layout ──────────────────────────────────────────────────────────────────

export interface PopupTokens {
  /** Written on the root as a percentage — the bubble's `left` along the rail. */
  offset: string
  /** Written on the root in px — the arrow's correction toward the trigger centre. */
  arrow: string
  /** Read: the arrow's square size. */
  arrowSize: string
  /** Read: the radius the arrow must stay inside (bubble corner or arrow corner — the caller's contract). */
  arrowRadius: string
  /** Read: the site padding; half of it is the viewport inset the bubble keeps. */
  inset: string
}

export interface LayoutPopupOptions {
  /** The component root: receives `data-direction` and the two written tokens. */
  root: HTMLElement
  /** The element the bubble points at. ToggleTip passes the root itself; fields pass `.trigger`. */
  trigger: HTMLElement
  /** The slide rail the bubble travels along. */
  rail: HTMLElement
  /** The bubble. Must be laid out (not `display: none`) when this runs. */
  popup: HTMLElement
  tokens: PopupTokens
}

/**
 * Position an open popup: direction, offset along the rail, arrow correction.
 * Skips silently when the rail or popup has no width (hidden, not yet laid
 * out) so a stray call never writes garbage. Returns the direction, or null
 * when skipped.
 */
export function layoutPopup(opts: LayoutPopupOptions): PopupDirection | null {
  const { root, trigger, rail, popup, tokens } = opts

  const railRect = rail.getBoundingClientRect()
  const popupRect = popup.getBoundingClientRect()
  if (!railRect.width || !popupRect.width) return null

  const direction = updateDirection(root, trigger)

  const triggerRect = trigger.getBoundingClientRect()
  const triggerCenterX = triggerRect.left + triggerRect.width / 2
  const viewportInset = readCssPx(root, tokens.inset) / 2

  const offset = calculatePopupOffset(
    triggerCenterX,
    railRect.left,
    railRect.width,
    popupRect.width,
    window.innerWidth,
    viewportInset,
  )
  root.style.setProperty(tokens.offset, `${offset}%`)

  // The bubble's left edge after the offset applies — computed, not measured,
  // because the custom property change has not reached layout yet.
  const popupLeft = railRect.left + (offset / 100) * railRect.width - popupRect.width / 2
  const arrowOffset = calculateArrowOffset(
    triggerCenterX,
    popupLeft,
    popupRect.width,
    readCssPx(root, tokens.arrowRadius),
    readCssPx(root, tokens.arrowSize),
  )
  root.style.setProperty(tokens.arrow, `${arrowOffset}px`)

  return direction
}

// ─── Resize ──────────────────────────────────────────────────────────────────

/**
 * Call `onResize` at most once per frame while the window resizes. Removed,
 * and any pending frame cancelled, when `signal` aborts.
 */
export function watchResize(onResize: () => void, signal: AbortSignal): void {
  let frame: number | null = null

  window.addEventListener(
    'resize',
    () => {
      if (frame !== null) cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        frame = null
        onResize()
      })
    },
    { signal },
  )

  signal.addEventListener(
    'abort',
    () => {
      if (frame !== null) cancelAnimationFrame(frame)
      frame = null
    },
    { once: true },
  )
}

// ─── Light dismiss ───────────────────────────────────────────────────────────

export type DismissReason = 'outside' | 'focusout' | 'escape'

export interface LightDismissOptions {
  /** Pointer and focus events inside this element never dismiss. */
  root: HTMLElement
  /**
   * Which pointer event counts as "outside". ToggleTip closes on `mousedown`
   * (before focus moves); the fields close on `click` (after their own
   * handlers ran). Default `mousedown`.
   */
  pointer?: 'mousedown' | 'click'
  /** Close when focus leaves the root. Default true. */
  focusout?: boolean
  /** Close on Escape pressed anywhere inside the root. Default true. */
  escape?: boolean
  /** Called once per dismissal with the reason. The caller closes and decides about focus. */
  onDismiss: (reason: DismissReason) => void
  /** Removes every listener when aborted — abort it on close. */
  signal: AbortSignal
}

/**
 * Install light-dismiss behaviour for an open popup: a pointer event outside
 * the root, focus leaving the root, or Escape inside it. Each fires
 * `onDismiss(reason)`; the caller owns the actual close (and whether to
 * refocus the trigger — right after Escape, wrong after an outside click,
 * which would scroll back to the trigger and steal focus from what the user
 * clicked). All listeners go with the signal.
 */
export function lightDismiss(opts: LightDismissOptions): void {
  const { root, pointer = 'mousedown', focusout = true, escape = true, onDismiss, signal } = opts

  document.addEventListener(
    pointer,
    (event: Event) => {
      if (!root.contains(event.target as Node)) onDismiss('outside')
    },
    { signal },
  )

  if (focusout) {
    root.addEventListener(
      'focusout',
      (event: FocusEvent) => {
        if (!root.contains(event.relatedTarget as Node)) onDismiss('focusout')
      },
      { signal },
    )
  }

  if (escape) {
    root.addEventListener(
      'keydown',
      (event: KeyboardEvent) => {
        if (event.key !== 'Escape') return
        event.preventDefault()
        onDismiss('escape')
      },
      { signal },
    )
  }
}
