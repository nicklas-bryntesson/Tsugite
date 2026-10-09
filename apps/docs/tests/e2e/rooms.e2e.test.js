import { test, expect } from '@playwright/test'
import { checkA11y } from 'axe-playwright'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'

// The rooms: /map renders from the manifest, /docs/[slug] mounts the fixture
// sections, /control-room carries the drift checks. The components' own
// contracts run on their benches in the package (ADR-0026); these are the
// rooms' own.

const axeSource = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8')

test('the map renders a card for every published manifest entry', async ({ page }) => {
  // The manifest is the truth; the map must not drop entries.
  const { manifest } = await import('../../src/lib/manifest.ts')
  await page.goto('/map')
  for (const entry of manifest.filter((e) => e.published)) {
    await expect(page.locator(`.MapPage a.minicard[href="/docs/${entry.slug}"]`), entry.slug).toHaveCount(1)
  }
  // pillars + ground strip exist
  for (const label of ['Primitives', 'Compositions', 'Regions', 'Foundations', 'Kernel']) {
    await expect(page.getByRole('heading', { name: label })).toBeVisible()
  }
})

test('a docs page mounts its section with metadata chips', async ({ page }) => {
  await page.goto('/docs/notice')
  await expect(page.getByRole('heading', { level: 1, name: 'Notice' })).toBeVisible()
  await expect(page.locator('.ExamplePageHead .chip[data-primary="true"]')).toHaveText('Primitives')
  // an explicit page: its own examples first, and the fixture section mounted as the bench
  await expect(page.locator('.Example').first()).toBeVisible()
  await expect(page.locator('.doc-bench .KitchenSink-section#Notice')).toBeVisible()
})

test('a fields page carries the family badge and attaches its component', async ({ page }) => {
  await page.goto('/docs/affix-field')
  await expect(page.locator('.ExamplePageHead .chip[data-primary="false"]', { hasText: 'fields' })).toHaveCount(1)
  await expect(page.locator('[data-component="AffixField"][data-initialized="true"]').first()).toBeVisible()
})

test('foundations: the color page renders from the factories', async ({ page }) => {
  const { rawColorTokens } = await import('tsugite/theme-default/raw.color.tokens.js')
  await page.goto('/docs/color')
  // every RAW color gets a card — the count comes from the same source as the CSS
  await expect(page.locator('.ColorDoc .ramp > li')).toHaveCount(Object.keys(rawColorTokens).length)
  // the live column resolves (no empty swatch)
  const bg = await page.evaluate(() => {
    const sw = document.querySelector('.cell-swatch.live')
    return sw ? getComputedStyle(sw).backgroundColor : null
  })
  expect(bg).not.toBe('rgba(0, 0, 0, 0)')
})

test('control room: the field-height contract holds in the controls row', async ({ page }) => {
  // The mechanical twin of the controls row (field-height: 2.5rem).
  // The field is the contract carrier; whether a button lines up with
  // it is a FINDING the row exists to show — not asserted here.
  await page.goto('/control-room')
  for (const side of ['native', 'fallback']) {
    const affix = await page.locator(`#TextBox .row[data-sample="A field with a value, a button"] [data-side="${side}"] .AffixField .input`).boundingBox()
    expect(affix.height, `controls row, ${side}: AffixField input = 2.5rem`).toBe(40)
  }
})

test('control room: the resolution panel answers every probe live', async ({ page }) => {
  await page.goto('/control-room')
  for (const probe of ['gamut', 'oklch', 'property', 'colormix', 'cq', 'textboxtrim']) {
    await expect(page.locator(`[data-probe="${probe}"]`), probe).not.toBeEmpty()
  }
  // headless Chromium resolves the modern branches
  await expect(page.locator('[data-probe="oklch"]')).toHaveText('supported')
  await expect(page.locator('[data-probe="gamut"]')).toHaveText(/rec2020|p3|srgb/)
})

test('the control room shares the donut matrix with the bench', async ({ page }) => {
  await page.goto('/control-room')
  await expect(page.locator('#Themes .theme-cell[data-theme="brand"][data-prominence="primary"]')).toBeVisible()
  await expect(page.locator('#Themes .theme-cell[data-forbidden]')).toHaveCount(1)
})

test('map and control room pass axe, light and dark', async ({ page }) => {
  for (const path of ['/map', '/control-room']) {
    await page.goto(path)
    await page.addStyleTag({ content: '*,*::before,*::after{transition-duration:0s!important;animation-duration:0s!important}' })
    for (const colorScheme of ['light', 'dark']) {
      await page.emulateMedia({ colorScheme })
      await page.evaluate(axeSource)
      await checkA11y(page, 'main', { detailedReport: true })
    }
  }
})
