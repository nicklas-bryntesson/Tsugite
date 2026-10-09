import { test, expect } from '@playwright/test'

// The home page's Cover: a donut whose content takes inverse claims on the scrim through
// the generated voice (ADR-0006). It moved here from the package's themes suite, which
// runs on the theme's bench and cannot reach a docs page.

/** Computed [r,g,b] via canvas — immune to rgb/oklch serialization. */
const colorOf = (page, selector, prop) =>
  page.evaluate(([s, p]) => {
    const el = document.querySelector(s)
    if (!el) return null
    const ctx = document.createElement('canvas').getContext('2d')
    ctx.fillStyle = getComputedStyle(el)[p]
    ctx.fillRect(0, 0, 1, 1)
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
    return [r, g, b]
  }, [selector, prop])

const luminance = ([r, g, b]) => {
  const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}

test('the Cover donut still gets its inverse claims through the generated voice', async ({ page }) => {
  await page.goto('/')
  await page.emulateMedia({ colorScheme: 'light' })
  const btn = await colorOf(page, '.CoverComposition .content-container .Button[data-emphasis="primary"]', 'backgroundColor')
  const text = await colorOf(page, '.CoverComposition .content-container .Heading', 'color')
  expect(luminance(btn), 'light chip on the scrim (preserved rows)').toBeGreaterThan(0.9)
  expect(luminance(text), 'light heading on the scrim').toBeGreaterThan(0.9)
})
