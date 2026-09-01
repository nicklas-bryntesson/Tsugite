import { test, expect } from '@playwright/test'
import { checkA11y } from 'axe-playwright'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { targetPath } from './helpers/target.js'

// checkA11y needs window.axe; we inject the package's axe-core directly.
const axeSource = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8')
const injectRealAxe = (page) => page.evaluate(axeSource)

/** The ThemeSwitch suite's documented gotcha, third sighting: buttons carry
    `transition: color …`, so an axe run right after an emulateMedia flip
    samples MID-TRANSITION colors and reports false contrast failures.
    Freeze the motion; we assert settled values. */
const freezeTransitions = (page) => page.addStyleTag({
  content: `*, *::before, *::after {
    transition-duration: 0s !important;
    animation-duration: 0s !important;
  }`,
})

// Theme voices (ADR-0006) — the donut-scope matrix's mechanical twin.
// What only a browser can prove: that the generated voice blocks, the
// prominence wiring and the ownership chain actually meet in computed
// styles — per appearance mode — and that a forbidden combination and a
// voiceless page degrade to semantic defaults instead of breaking.

const CELL = (voice, volume) => `#Themes .theme-cell[data-theme="${voice}"][data-prominence="${volume}"]`

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

test.beforeEach(async ({ page }) => {
  await page.goto(targetPath())
  await freezeTransitions(page)
  await page.locator('#Themes').scrollIntoViewIfNeeded()
})

test('voice cells paint their surfaces — brand primary is deep, subtle is pale (light)', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' })
  const primary = await colorOf(page, CELL('brand', 'primary'), 'backgroundColor')
  const subtle = await colorOf(page, CELL('brand', 'subtle'), 'backgroundColor')
  expect(luminance(primary), 'brand×primary: deep surface').toBeLessThan(0.1)
  expect(luminance(subtle), 'brand×subtle: pale surface').toBeGreaterThan(0.8)
  // and blue, not gray: the blue channel dominates on the deep surface
  expect(primary[2]).toBeGreaterThan(primary[0])
})

test('the button inverts on the full brand voice and stays default on subtle', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' })
  const onPrimary = await colorOf(page, `${CELL('brand', 'primary')} .Button[data-emphasis="primary"]`, 'backgroundColor')
  const onSubtle = await colorOf(page, `${CELL('brand', 'subtle')} .Button[data-emphasis="primary"]`, 'backgroundColor')
  expect(luminance(onPrimary), 'light chip on the deep voice').toBeGreaterThan(0.8)
  expect(luminance(onSubtle), 'dark button on the subtle voice').toBeLessThan(0.1)
})

test('brand adapts to dark mode; accent is authored mode-stable (ADR-0006 §4)', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' })
  const accentLight = await colorOf(page, CELL('accent', 'primary'), 'backgroundColor')
  const brandLight = await colorOf(page, CELL('brand', 'subtle'), 'backgroundColor')

  await page.emulateMedia({ colorScheme: 'dark' })
  const accentDark = await colorOf(page, CELL('accent', 'primary'), 'backgroundColor')
  const brandDark = await colorOf(page, CELL('brand', 'subtle'), 'backgroundColor')

  // stable: same deep magenta in both modes
  expect(accentDark, 'accent holds its ground').toEqual(accentLight)
  // adaptive: subtle brand flips from pale to deep
  expect(luminance(brandLight)).toBeGreaterThan(0.8)
  expect(luminance(brandDark)).toBeLessThan(0.1)
})

test('prominence without a voice re-aims within the inherited donut', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' })
  const nested = '#Themes .theme-cell[data-theme="brand"] .theme-cell[data-prominence="subtle"]'
  const bg = await colorOf(page, nested, 'backgroundColor')
  const text = await colorOf(page, nested, 'color')
  expect(luminance(bg), 'nested subtle inside brand = pale brand surface').toBeGreaterThan(0.8)
  expect(luminance(text), 'text follows the volume').toBeLessThan(0.15)
})

test('the forbidden combination does not exist — and says so', async ({ page }) => {
  const forbidden = page.locator('#Themes .theme-cell[data-forbidden]')
  await expect(forbidden).toHaveCount(1)
  await expect(forbidden).toContainText('Not defined')
  // and no generated cell ever leaks inverse×subtle values
  const leaked = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--theme-cell-subtle-surface'))
  expect(leaked).toBe('')
})

test('the Cover donut still gets its inverse claims through the generated voice', async ({ page }) => {
  await page.goto('/')
  await page.emulateMedia({ colorScheme: 'light' })
  const btn = await colorOf(page, '.CoverComposition .content-container .Button[data-emphasis="primary"]', 'backgroundColor')
  const text = await colorOf(page, '.CoverComposition .content-container .Heading', 'color')
  expect(luminance(btn), 'light chip on the scrim (preserved rows)').toBeGreaterThan(0.9)
  expect(luminance(text), 'light heading on the scrim').toBeGreaterThan(0.9)
})

test('axe is clean across the matrix, light and dark', async ({ page }) => {
  for (const colorScheme of ['light', 'dark']) {
    await page.emulateMedia({ colorScheme })
    await injectRealAxe(page)
    await checkA11y(page, '#Themes', { detailedReport: true })
  }
})
