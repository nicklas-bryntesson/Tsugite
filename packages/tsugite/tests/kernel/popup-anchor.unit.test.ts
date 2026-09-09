// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  readCssPx,
  updateDirection,
  layoutPopup,
  watchResize,
  lightDismiss,
} from '../../kernel/js/popup-anchor'

// jsdom does no layout: every getBoundingClientRect() is zeros. The tests give
// each element the rect the browser would have measured, and the module's
// arithmetic is checked against popup-position's known answers.
function rect(el: HTMLElement, r: Partial<DOMRect>): void {
  const full = { x: 0, y: 0, top: 0, left: 0, bottom: 0, right: 0, width: 0, height: 0, toJSON() {} }
  el.getBoundingClientRect = () => ({ ...full, ...r }) as DOMRect
}

function scene() {
  const root = document.createElement('div')
  const trigger = document.createElement('button')
  const rail = document.createElement('div')
  const popup = document.createElement('div')
  root.append(trigger, rail)
  rail.append(popup)
  document.body.append(root)
  return { root, trigger, rail, popup }
}

const tokens = {
  offset: '--_x-popup-offset',
  arrow: '--_x-arrow-offset',
  arrowSize: '--_x-arrow-size',
  arrowRadius: '--_x-arrow-radius',
  inset: '--_x-site-padding',
}

beforeEach(() => {
  Object.defineProperty(window, 'innerWidth', { value: 1200, configurable: true })
  Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true })
})

afterEach(() => {
  document.body.innerHTML = ''
  vi.restoreAllMocks()
})

// ─── readCssPx ───────────────────────────────────────────────────────────────

describe('readCssPx', () => {
  it('appends a hidden probe, measures it, and removes it', () => {
    const host = document.createElement('div')
    document.body.append(host)
    const appended: HTMLElement[] = []
    const origAppend = host.appendChild.bind(host)
    host.appendChild = ((node: Node) => {
      appended.push(node as HTMLElement)
      ;(node as HTMLElement).getBoundingClientRect = () => ({ width: 12 }) as DOMRect
      return origAppend(node)
    }) as typeof host.appendChild

    expect(readCssPx(host, '--_x-arrow-size')).toBe(12)
    expect(appended).toHaveLength(1)
    expect(appended[0].style.width).toBe('var(--_x-arrow-size,0px)')
    expect(appended[0].style.visibility).toBe('hidden')
    expect(host.childElementCount).toBe(0)
  })

  it('returns 0 when the property resolves to nothing (jsdom lays out nothing)', () => {
    const host = document.createElement('div')
    document.body.append(host)
    expect(readCssPx(host, '--_x-unset')).toBe(0)
  })
})

// ─── updateDirection ─────────────────────────────────────────────────────────

describe('updateDirection', () => {
  it('writes top when there is more room above', () => {
    const { root, trigger } = scene()
    rect(trigger, { top: 600, bottom: 620 })
    expect(updateDirection(root, trigger)).toBe('top')
    expect(root.dataset.direction).toBe('top')
  })

  it('writes bottom when there is more room below', () => {
    const { root, trigger } = scene()
    rect(trigger, { top: 10, bottom: 30 })
    expect(updateDirection(root, trigger)).toBe('bottom')
    expect(root.dataset.direction).toBe('bottom')
  })

  it('does not touch the attribute when the direction is unchanged', () => {
    const { root, trigger } = scene()
    rect(trigger, { top: 600, bottom: 620 })
    updateDirection(root, trigger)
    const spy = vi.spyOn(root, 'setAttribute')
    updateDirection(root, trigger)
    expect(spy).not.toHaveBeenCalled()
  })
})

// ─── layoutPopup ─────────────────────────────────────────────────────────────

describe('layoutPopup', () => {
  it('skips and returns null when the rail or popup has no width', () => {
    const { root, trigger, rail, popup } = scene()
    rect(rail, { width: 0 })
    rect(popup, { width: 200 })
    expect(layoutPopup({ root, trigger, rail, popup, tokens })).toBeNull()
    expect(root.style.getPropertyValue(tokens.offset)).toBe('')
  })

  it('writes direction, a centred offset and a zero arrow for a centred trigger', () => {
    const { root, trigger, rail, popup } = scene()
    // rail 0–1000, popup 200 wide, trigger centred at 500 low on the page
    rect(rail, { left: 0, width: 1000 })
    rect(popup, { width: 200 })
    rect(trigger, { left: 490, width: 20, top: 600, bottom: 620 })

    const direction = layoutPopup({ root, trigger, rail, popup, tokens })

    expect(direction).toBe('top')
    expect(root.dataset.direction).toBe('top')
    expect(parseFloat(root.style.getPropertyValue(tokens.offset))).toBeCloseTo(50)
    expect(root.style.getPropertyValue(tokens.offset)).toMatch(/%$/)
    expect(root.style.getPropertyValue(tokens.arrow)).toBe('0px')
  })

  it('clamps the offset at the viewport edge and swings the arrow toward the trigger', () => {
    const { root, trigger, rail, popup } = scene()
    // trigger at 1150 near the right edge of a 1200 viewport: popup-position
    // clamps the bubble to end at 1200 (offset 110%), so its centre is 1100
    // and the arrow must move +50px toward the trigger.
    rect(rail, { left: 0, width: 1000 })
    rect(popup, { width: 200 })
    rect(trigger, { left: 1140, width: 20, top: 600, bottom: 620 })

    layoutPopup({ root, trigger, rail, popup, tokens })

    expect(parseFloat(root.style.getPropertyValue(tokens.offset))).toBeCloseTo(110)
    // arrowRadius and arrowSize read as 0 in jsdom → limit = 100, raw 50 fits
    expect(root.style.getPropertyValue(tokens.arrow)).toBe('50px')
  })

  it('reads the caller-named tokens through the probe', () => {
    const { root, trigger, rail, popup } = scene()
    rect(rail, { left: 0, width: 1000 })
    rect(popup, { width: 200 })
    rect(trigger, { left: 490, width: 20, top: 600, bottom: 620 })
    const seen: string[] = []
    const origAppend = root.appendChild.bind(root)
    root.appendChild = ((node: Node) => {
      const el = node as HTMLElement
      if (el.style?.width.startsWith('var(')) seen.push(el.style.width)
      return origAppend(node)
    }) as typeof root.appendChild

    layoutPopup({ root, trigger, rail, popup, tokens })

    expect(seen).toEqual([
      'var(--_x-site-padding,0px)',
      'var(--_x-arrow-radius,0px)',
      'var(--_x-arrow-size,0px)',
    ])
  })
})

// ─── watchResize ─────────────────────────────────────────────────────────────

describe('watchResize', () => {
  it('coalesces a burst of resize events into one frame', () => {
    const frames: FrameRequestCallback[] = []
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      frames.push(cb)
      return frames.length
    })
    vi.stubGlobal('cancelAnimationFrame', (id: number) => {
      frames[id - 1] = () => {}
    })
    const onResize = vi.fn()
    const ac = new AbortController()

    watchResize(onResize, ac.signal)
    window.dispatchEvent(new Event('resize'))
    window.dispatchEvent(new Event('resize'))
    window.dispatchEvent(new Event('resize'))
    frames.forEach(cb => cb(0))

    expect(onResize).toHaveBeenCalledTimes(1)
    ac.abort() // the watcher must not outlive its test
    vi.unstubAllGlobals()
  })

  it('stops listening and cancels a pending frame on abort', () => {
    const frames: FrameRequestCallback[] = []
    const cancelled: number[] = []
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      frames.push(cb)
      return frames.length
    })
    vi.stubGlobal('cancelAnimationFrame', (id: number) => {
      cancelled.push(id)
    })
    const onResize = vi.fn()
    const ac = new AbortController()

    watchResize(onResize, ac.signal)
    window.dispatchEvent(new Event('resize'))
    ac.abort()
    window.dispatchEvent(new Event('resize'))

    expect(cancelled).toEqual([1])
    expect(frames).toHaveLength(1)
    vi.unstubAllGlobals()
  })
})

// ─── lightDismiss ────────────────────────────────────────────────────────────

describe('lightDismiss', () => {
  function armed(overrides: Partial<Parameters<typeof lightDismiss>[0]> = {}) {
    const { root, trigger } = scene()
    const outside = document.createElement('button')
    document.body.append(outside)
    const onDismiss = vi.fn()
    const ac = new AbortController()
    lightDismiss({ root, onDismiss, signal: ac.signal, ...overrides })
    return { root, trigger, outside, onDismiss, ac }
  }

  it('reports outside on a mousedown outside the root, not inside', () => {
    const { trigger, outside, onDismiss } = armed()
    trigger.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    expect(onDismiss).not.toHaveBeenCalled()
    outside.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    expect(onDismiss).toHaveBeenCalledWith('outside')
  })

  it('can listen to click instead of mousedown (the fields’ contract)', () => {
    const { outside, onDismiss } = armed({ pointer: 'click' })
    outside.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    expect(onDismiss).not.toHaveBeenCalled()
    outside.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(onDismiss).toHaveBeenCalledWith('outside')
  })

  it('reports focusout when focus leaves the root, not when it moves within it', () => {
    const { root, trigger, outside, onDismiss } = armed()
    const inner = document.createElement('a')
    root.append(inner)
    trigger.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: inner }))
    expect(onDismiss).not.toHaveBeenCalled()
    trigger.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: outside }))
    expect(onDismiss).toHaveBeenCalledWith('focusout')
  })

  it('reports escape on Escape inside the root and prevents the default', () => {
    const { trigger, onDismiss } = armed()
    const other = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
    trigger.dispatchEvent(other)
    expect(onDismiss).not.toHaveBeenCalled()
    const esc = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
    trigger.dispatchEvent(esc)
    expect(onDismiss).toHaveBeenCalledWith('escape')
    expect(esc.defaultPrevented).toBe(true)
  })

  it('lets a component with its own keyboard routing opt out of Escape', () => {
    const { trigger, onDismiss } = armed({ escape: false })
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('removes every listener when the signal aborts', () => {
    const { trigger, outside, onDismiss, ac } = armed()
    ac.abort()
    outside.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    trigger.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: outside }))
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    expect(onDismiss).not.toHaveBeenCalled()
  })
})
