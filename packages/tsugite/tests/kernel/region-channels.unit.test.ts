import { describe, it, expect } from 'vitest'
import { commandOf } from '../../kernel/js/region-channels'

// A pure function — no DOM. The install itself is exercised in tests/e2e/modal.e2e.test.js,
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
