import { test, expect } from '@playwright/test'
import { injectAxe } from 'axe-playwright'
import { scopedCheckA11y, targetPath } from './helpers/target.js'

// Button on its bench (ADR-0026): every cell of both state maps, one button per line,
// named by data-bench-case="<door>/<content>/<states>".

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
  for (const el of await page.locator('[data-bench-case^="action/"]').all()) {
    expect(await el.evaluate((n) => n.tagName)).toBe('BUTTON')
  }
  for (const el of await page.locator('[data-bench-case^="link/"]').all()) {
    expect(await el.evaluate((n) => n.tagName)).toBe('A')
  }
})

test('a link has no disabled case', async ({ page }) => {
  await expect(page.locator('[data-bench-case^="link/"][data-bench-case*="disabled"]')).toHaveCount(0)
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

test('the bench passes axe', async ({ page }) => {
  await injectAxe(page)
  await scopedCheckA11y(page, '.Bench')
})
