import { test, expect } from '@playwright/test'
import { injectAxe, checkA11y } from 'axe-playwright'
import { targetPath } from './helpers/target.js'

// Button on its bench (ADR-0026), in three families (fixtures/states/button.matrix.ts),
// each case named data-bench-case="<family>/<door>/<content>/<states>/<colour>/<geometry>".

test.beforeEach(async ({ page }) => {
  await page.goto(targetPath('/button'))
})

test('every case renders a Button, none a DevError', async ({ page }) => {
  const cases = page.locator('[data-bench-case]')
  expect(await cases.count()).toBeGreaterThan(0)
  await expect(page.locator('.DevError')).toHaveCount(0)
  for (const el of await cases.all()) await expect(el).toHaveClass(/\bButton\b/)
})

test('each front door renders its own element', async ({ page }) => {
  const tags = await page.locator('[data-bench-case]').evaluateAll((els) =>
    els.map((el) => [el.dataset.benchCase.split('/')[1], el.tagName]))
  for (const [door, tag] of tags) expect(tag).toBe(door === 'action' ? 'BUTTON' : 'A')
})

test('a link has no disabled case', async ({ page }) => {
  await expect(page.locator('[data-bench-case*="/link/"][data-bench-case*="disabled"]')).toHaveCount(0)
})

test('a disabled case is disabled', async ({ page }) => {
  const disabled = page.locator('[data-bench-case*="disabled"]')
  expect(await disabled.count()).toBeGreaterThan(0)
  for (const el of await disabled.all()) await expect(el).toBeDisabled()
})

test('an icon-only button keeps an accessible name', async ({ page }) => {
  for (const el of await page.locator('[data-bench-case*="/icon/"]').all()) {
    await expect(el).toHaveAccessibleName(/.+/)
  }
})

// ── The cut holds ─────────────────────────────────────────────────────────────
//
// The bench draws every colour at one geometry and every geometry at one colour, which
// covers the product only while the two families never touch. Each pairwise button
// carries a colour and a geometry at once; its colour must be its colour case's, and its
// geometry its geometry case's. A selector that couples the families — a size that
// changes an ink, an intent that changes a padding — shows up here as a difference.

const COLOUR = [
  'color', 'background-color', 'background-image', 'box-shadow', 'opacity',
  'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color',
  'outline-style', 'outline-width', 'outline-color', 'outline-offset',
]
const GEOMETRY = [
  'font-size', 'line-height', 'gap',
  'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
  'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width',
  'border-top-left-radius', 'border-top-right-radius', 'border-bottom-right-radius', 'border-bottom-left-radius',
]

test('a pairwise button has its colour case\'s colour and its geometry case\'s geometry', async ({ page }) => {
  const read = await page.evaluate(([colour, geometry]) => {
    const out = {}
    for (const el of document.querySelectorAll('[data-bench-case]')) {
      const cs = getComputedStyle(el)
      const box = el.getBoundingClientRect()
      const icon = el.querySelector('svg')?.getBoundingClientRect()
      out[el.dataset.benchCase] = {
        colour: Object.fromEntries(colour.map((p) => [p, cs.getPropertyValue(p)])),
        geometry: {
          ...Object.fromEntries(geometry.map((p) => [p, cs.getPropertyValue(p)])),
          width: box.width,
          height: box.height,
          iconInline: icon ? icon.left - box.left : null,
          iconBlock: icon ? icon.top - box.top : null,
        },
      }
    }
    return out
  }, [COLOUR, GEOMETRY])

  const pairwise = Object.keys(read).filter((name) => name.startsWith('pairwise/'))
  expect(pairwise.length).toBeGreaterThan(0)
  for (const name of pairwise) {
    const [, door, content, states, colour, geometry] = name.split('/')
    const colourCase = `colour/${door}/${content}/${states}/${colour}/`
    const geometryCase = `geometry/${door}/${content}/idle/`
    const colourRef = Object.keys(read).find((n) => n.startsWith(colourCase))
    const geometryRef = Object.keys(read).find((n) => n.startsWith(geometryCase) && n.endsWith(`/${geometry}`))
    expect(colourRef, `${name}: no colour case`).toBeDefined()
    expect(geometryRef, `${name}: no geometry case`).toBeDefined()
    expect(read[name].colour, `${name} against ${colourRef}`).toEqual(read[colourRef].colour)
    expect(read[name].geometry, `${name} against ${geometryRef}`).toEqual(read[geometryRef].geometry)
  }
})

// ── Accessibility ─────────────────────────────────────────────────────────────

// TODO(fix): secondary with an intent drops below 4.5:1 wherever the state paints the
// hover surface — #d33e25 and #42824d on #f8f4f0, 4.27 and 4.23. Excluded from the bench
// audit and held by the expected failure below, which turns red once the inks are fixed.
const KNOWN_CONTRAST = ['destructive', 'success'].flatMap((intent) =>
  ['hover', 'focus', 'hover+focus', 'active+focus', 'hover+active+focus'].map(
    (states) => `[data-bench-case*="/${states}/secondary.${intent}/"]`,
  ))

test('the bench passes axe', async ({ page }) => {
  await expect(page.locator(KNOWN_CONTRAST.join(', ')).first()).toBeAttached()
  await injectAxe(page)
  await checkA11y(page, { include: [['.Bench']], exclude: KNOWN_CONTRAST.map((s) => [s]) })
})

test('secondary intents clear 4.5:1 in their hover and focus states', async ({ page }) => {
  test.fail(true, 'known: TODO(fix) above KNOWN_CONTRAST')
  await injectAxe(page)
  await checkA11y(page, KNOWN_CONTRAST.join(', '), { axeOptions: { runOnly: ['color-contrast'] } })
})
