import { describe, it, expect } from 'vitest'
import { commandOf, isOutside } from '../../kernel/js/region-channels'

// Pure functions — no DOM. The install itself is exercised in tests/e2e/modal.e2e.test.js,
// with the platform features removed so the fallbacks run.

describe('commandOf', () => {
  it('answers the two commands a dialog region hears', () => {
    expect(commandOf('show-modal')).toBe('show-modal')
    expect(commandOf('close')).toBe('close')
  })

  it('leaves everything else to the platform', () => {
    for (const command of ['request-close', 'toggle-popover', 'show-popover', '--custom', '', null]) {
      expect(commandOf(command)).toBeNull()
    }
  })
})

describe('isOutside', () => {
  const box = { left: 100, right: 300, top: 50, bottom: 250 }

  it('is false inside the box and on its edges', () => {
    expect(isOutside(box, 200, 150)).toBe(false)
    expect(isOutside(box, 100, 50)).toBe(false)
    expect(isOutside(box, 300, 250)).toBe(false)
  })

  it('is true past any edge', () => {
    expect(isOutside(box, 99, 150)).toBe(true)
    expect(isOutside(box, 301, 150)).toBe(true)
    expect(isOutside(box, 200, 49)).toBe(true)
    expect(isOutside(box, 200, 251)).toBe(true)
  })
})
