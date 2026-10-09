import { test, expect } from '@playwright/test'
import { injectAxe } from 'axe-playwright'
import { scopedCheckA11y, targetPath } from './helpers/target.js'

// Notice on its bench (ADR-0026): every severity per decoration, named
// data-bench-case="<severity>/<decoration>", plus the part shapes by name.

test.beforeEach(async ({ page }) => {
  await page.goto(targetPath('/notice'))
})

const caseOf = (page, name) => page.locator(`[data-bench-case="${name}"]`)

test('every case renders a Notice, none a DevError', async ({ page }) => {
  await expect(page.locator('.DevError')).toHaveCount(0)
  for (const el of await page.locator('[data-bench-case]:not([data-bench-case="region"])').all()) {
    await expect(el).toHaveClass(/\bNotice\b/)
  }
})

// ── Separation of concerns (ADR-0016) ─────────────────────────────────────────

test('Notice carries no live role; the region does', async ({ page }) => {
  const region = caseOf(page, 'region')
  await expect(region).toHaveAttribute('role', 'alert')
  await expect(region).toHaveAttribute('aria-live', 'assertive')
  expect(await region.locator('.Notice').getAttribute('role')).toBeNull()
  for (const el of await page.locator('.Notice').all()) expect(await el.getAttribute('role')).toBeNull()
})

// ── Variants + emphasis ───────────────────────────────────────────────────────

test('variants tint the icon with distinct accents', async ({ page }) => {
  const iconColor = (variant) =>
    caseOf(page, `${variant}/rest`).locator('.icon').evaluate((el) => getComputedStyle(el).color)

  const [error, success, info] = await Promise.all([iconColor('error'), iconColor('success'), iconColor('info')])
  expect(new Set([error, success, info]).size).toBe(3) // all different
})

test('base default has no border; data-border adds a full accent border', async ({ page }) => {
  const w = (loc) => loc.evaluate((el) => parseFloat(getComputedStyle(el).borderTopWidth))
  expect(await w(caseOf(page, 'error/rest'))).toBe(0)
  expect(await w(caseOf(page, 'error/border'))).toBeGreaterThan(0)
})

test('data-emphasis adds a leading accent bar the base lacks', async ({ page }) => {
  const lead = (loc) => loc.evaluate((el) => parseFloat(getComputedStyle(el).borderInlineStartWidth))
  expect(await lead(caseOf(page, 'error/emphasis'))).toBeGreaterThan(await lead(caseOf(page, 'error/rest')))
})

// ── Optional icon ─────────────────────────────────────────────────────────────

test('data-icon="false" renders no icon and collapses to one column', async ({ page }) => {
  const notice = caseOf(page, 'info/no-icon')
  await expect(notice).toHaveAttribute('data-icon', 'false')
  await expect(notice.locator('svg')).toHaveCount(0)
  const cols = await notice.evaluate((el) => getComputedStyle(el).gridTemplateColumns)
  // single track (no "auto 1fr" two-column split)
  expect(cols.trim().split(/\s+/).length).toBe(1)
})

test('icons are decorative (aria-hidden)', async ({ page }) => {
  const icons = page.locator('.Notice .icon svg')
  const n = await icons.count()
  expect(n).toBeGreaterThan(0)
  for (let i = 0; i < n; i++) {
    await expect(icons.nth(i)).toHaveAttribute('aria-hidden', 'true')
  }
})

// ── Accessibility ─────────────────────────────────────────────────────────────

test('no axe violations across the bench', async ({ page }) => {
  await injectAxe(page)
  await scopedCheckA11y(page, '.Bench')
})
