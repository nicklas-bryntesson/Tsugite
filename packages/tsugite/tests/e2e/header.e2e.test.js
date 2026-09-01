import { test, expect } from '@playwright/test'
import { checkA11y, injectAxe } from 'axe-playwright'

// Site-level suite for the header ThemeSwitch. The component conformance suite
// (themeswitch.e2e.test.js) owns the component contract against the kitchen-sink
// demo instance; THIS suite owns what only the site can promise:
//   - every page carries a live, attached switch in the header
//   - a choice made in the header survives navigation
//   - two live instances on one page (header + kitchen-sink demo) stay in sync
//     — the multi-instance contract the reference library never had to state,
//     because its kitchen sink was the only page and had exactly one live copy.

const HEADER_TS = '.Header .ThemeSwitch[data-component="ThemeSwitch"]'
const DEMO_TS = '.ThemeSwitch[data-component="ThemeSwitch"][data-id="live"]'

const appearanceAttr = (page) =>
  page.evaluate(() => document.documentElement.getAttribute('data-appearance'))

test('the header carries a live, attached ThemeSwitch on every page', async ({ page }) => {
  for (const path of ['/', '/kitchen-sink']) {
    await page.goto(path)
    const ts = page.locator(HEADER_TS)
    await expect(ts, path).toHaveAttribute('data-initialized', 'true')
    await expect(ts.locator('input[value="system"]'), path).toBeChecked()
  }
})

test('a choice made in the header projects, and survives navigation', async ({ page }) => {
  await page.goto('/')
  await page.locator(`${HEADER_TS} label[for="ts-header-dark"]`).click()
  expect(await appearanceAttr(page)).toBe('dark')

  await page.goto('/kitchen-sink')
  expect(await appearanceAttr(page)).toBe('dark')
  await expect(page.locator(`${HEADER_TS} input[value="dark"]`)).toBeChecked()
  // the demo instance reads the same stored preference at attach
  await expect(page.locator(`${DEMO_TS} input[value="dark"]`)).toBeChecked()
})

test('two live instances on one page stay in sync, both directions', async ({ page }) => {
  await page.goto('/kitchen-sink')

  // header → demo
  await page.locator(`${HEADER_TS} label[for="ts-header-dark"]`).click()
  await expect(page.locator(`${DEMO_TS} input[value="dark"]`)).toBeChecked()
  expect(await appearanceAttr(page)).toBe('dark')

  // demo → header (back to system: attribute must come OFF, ADR-0021)
  await page.locator(`${DEMO_TS} label[for="ts-system"]`).click()
  await expect(page.locator(`${HEADER_TS} input[value="system"]`)).toBeChecked()
  expect(await appearanceAttr(page)).toBe(null)
})

test('the header passes axe with the switch in place', async ({ page }) => {
  await page.goto('/')
  await injectAxe(page)
  await checkA11y(page, '.Header', { detailedReport: true })
})
