import { test, expect } from '@playwright/test'
import { checkA11y } from 'axe-playwright'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'

// The rooms: /map renders from the manifest, /docs/[slug] mounts the test
// bench's sections, /control-room carries the drift checks. The bench
// itself (/kitchen-sink) is untouched — these are the rooms' own contracts.

const axeSource = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8')

test('the map renders a card for every published manifest entry', async ({ page }) => {
  // The manifest is the truth; the map must not drop entries.
  const { manifest } = await import('../../src/lib/manifest.ts')
  await page.goto('/map')
  for (const entry of manifest.filter((e) => e.published && e.pillar !== 'chrome')) {
    await expect(page.locator(`a.card[href="/docs/${entry.slug}"]`), entry.slug).toHaveCount(1)
  }
  // pillars + ground strip exist
  for (const label of ['Primitives', 'Compositions', 'Regions', 'Foundations', 'Kernel', 'Chrome']) {
    await expect(page.getByRole('heading', { name: label })).toBeVisible()
  }
})

test('a docs page mounts its section with metadata chips', async ({ page }) => {
  await page.goto('/docs/notice')
  await expect(page.getByRole('heading', { level: 1, name: 'Notice' })).toBeVisible()
  await expect(page.locator('.chip[data-kind="pillar"]')).toHaveText('Primitives')
  // the section is the same component the bench mounts
  await expect(page.locator('.doc-demo .KitchenSink-section#Notice, .doc-demo [data-component="Notice"]').first()).toBeVisible()
})

test('a fields page carries the family badge and attaches its component', async ({ page }) => {
  await page.goto('/docs/affix-field')
  await expect(page.locator('.chip[data-kind="family"]')).toHaveText('fields')
  await expect(page.locator('[data-component="AffixField"][data-initialized="true"]').first()).toBeVisible()
})

test('foundations: the color page renders from the factories', async ({ page }) => {
  const { rawColorTokens } = await import('tsugite/theme-default/raw.color.tokens.js')
  await page.goto('/docs/color')
  // every RAW color gets a card — the count comes from the same source as the CSS
  await expect(page.locator('.raw-card')).toHaveCount(Object.keys(rawColorTokens).length)
  // the live column resolves (no empty swatch)
  const bg = await page.evaluate(() => {
    const sw = document.querySelector('.cell-swatch.live')
    return sw ? getComputedStyle(sw).backgroundColor : null
  })
  expect(bg).not.toBe('rgba(0, 0, 0, 0)')
})

test('control room: the field-height contract holds in every comparison row', async ({ page }) => {
  // The mechanical twin of the alignment table (field-height: 2.5rem).
  // The field is the contract carrier; whether a button size lines up with
  // it is a FINDING the table exists to show — not asserted here.
  await page.goto('/control-room')
  for (const size of ['sm', 'md', 'lg']) {
    const affix = await page.locator(`#Alignment [data-guide="${size}"] .AffixField .input`).boundingBox()
    expect(affix.height, `row ${size}: AffixField input = 2.5rem`).toBe(40)
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

test('control room: the baseline-trim check is mounted', async ({ page }) => {
  await page.goto('/control-room')
  await expect(page.locator('.text-alignment .Heading')).toBeVisible()
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
