import { test, expect } from '@playwright/test'
import { injectAxe } from 'axe-playwright'
import { scopedCheckA11y, targetPath } from './helpers/target.js'

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

const readCases = (page) =>
  page.evaluate(([colour, geometry]) => {
    const out = {}
    for (const el of document.querySelectorAll('[data-bench-case]')) {
      const cs = getComputedStyle(el)
      const box = el.getBoundingClientRect()
      const icon = el.querySelector('svg')?.getBoundingClientRect()
      // The glyphs, not the label's box: a stretched box hides where its text sits in it.
      const label = el.querySelector('.text')
      const range = label && document.createRange()
      range?.selectNodeContents(label)
      const text = range?.getBoundingClientRect()
      out[el.dataset.benchCase] = {
        colour: Object.fromEntries(colour.map((p) => [p, cs.getPropertyValue(p)])),
        geometry: {
          ...Object.fromEntries(geometry.map((p) => [p, cs.getPropertyValue(p)])),
          width: box.width,
          height: box.height,
          iconInline: icon ? icon.left - box.left : null,
          iconBlock: icon ? icon.top - box.top : null,
          textInline: text ? text.left - box.left : null,
          // one entry per line: a wrapped label's lines show its alignment, their union does not
          lines: range ? [...range.getClientRects()].map((r) => Math.round(r.left - box.left)) : null,
          textBlock: text ? text.top - box.top : null,
        },
      }
    }
    return out
  }, [COLOUR, GEOMETRY])

test('a pairwise button has its colour case\'s colour and its geometry case\'s geometry', async ({ page }) => {
  const read = await readCases(page)

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

// The two front doors render one table: a link and an action with the same content and
// geometry are the same box, label and icon in the same places. A <button> brings UA
// styles an <a> does not (it centres its text), so this is where they would show.
test('a link and an action with the same geometry are laid out alike', async ({ page }) => {
  const read = await readCases(page)
  const links = Object.keys(read).filter((name) => name.startsWith('geometry/link/'))
  expect(links.length).toBeGreaterThan(0)
  for (const link of links) {
    const [, , content, states, , geometry] = link.split('/')
    const action = Object.keys(read).find((n) =>
      n.startsWith(`geometry/action/${content}/${states}/`) && n.endsWith(`/${geometry}`))
    expect(action, `${link}: no action case`).toBeDefined()
    expect(read[link].geometry, `${link} against ${action}`).toEqual(read[action].geometry)
  }
})

// ── Accessibility ─────────────────────────────────────────────────────────────

test('the bench passes axe', async ({ page }) => {
  await injectAxe(page)
  await scopedCheckA11y(page, '.Bench')
})
