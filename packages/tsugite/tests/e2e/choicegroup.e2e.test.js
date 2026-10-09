import { test, expect } from '@playwright/test'
import { injectAxe } from 'axe-playwright'
import { scopedCheckA11y, targetPath } from './helpers/target.js'

// ChoiceGroup on its bench (ADR-0026): one group per shape, named data-bench-case.

test.beforeEach(async ({ page }) => {
  await page.goto(targetPath('/choice-group'))
})

const caseOf = (page, name) => page.locator(`[data-bench-case="${name}"]`)

test('every case renders a ChoiceGroup, none a DevError', async ({ page }) => {
  await expect(page.locator('.DevError')).toHaveCount(0)
  for (const el of await page.locator('[data-bench-case]').all()) await expect(el).toHaveClass(/\bChoiceGroup\b/)
})

// ── The legend is the group's accessible name ─────────────────────────────────

test('legend names the group (role=group)', async ({ page }) => {
  await expect(page.getByRole('group', { name: 'Legend above, radios' })).toBeVisible()
})

test('a hidden legend still provides the group name', async ({ page }) => {
  // data-legend="hidden" removes the legend visually but not from the a11y tree
  await expect(page.getByRole('group', { name: 'Legend hidden' })).toHaveCount(1)
  // visually removed (clipped to 1px) but present
  const box = await caseOf(page, 'hidden').locator('legend').boundingBox()
  expect(box.width).toBeLessThanOrEqual(2)
})

// ── Hint / error are wired as the group's accessible description ───────────────

test('hint is exposed as the group accessible description', async ({ page }) => {
  await expect(page.getByRole('group', { name: 'With hint' })).toHaveAccessibleDescription(/read after the legend/i)
})

test('group error is announced (role=alert) and described', async ({ page }) => {
  await expect(page.getByRole('group', { name: 'Invalid' })).toHaveAccessibleDescription(/group error/i)
  // the error is a Notice inside a persistent live region (the announcer)
  const region = caseOf(page, 'invalid').locator('.notice-region')
  await expect(region).toHaveAttribute('role', 'alert')
  await expect(region.locator('.Notice')).toHaveAttribute('data-variant', 'error')
})

// ── Layout: orientation ───────────────────────────────────────────────────────

test('horizontal orientation lays fields in a row', async ({ page }) => {
  const opts = caseOf(page, 'horizontal').locator('.ChoiceField')
  const first = await opts.nth(0).boundingBox()
  const second = await opts.nth(1).boundingBox()
  // same row → tops roughly aligned, second is to the right of the first
  expect(Math.abs(first.y - second.y)).toBeLessThan(4)
  expect(second.x).toBeGreaterThan(first.x)
})

test('vertical orientation stacks fields', async ({ page }) => {
  const opts = caseOf(page, 'above').locator('.ChoiceField')
  const first = await opts.nth(0).boundingBox()
  const second = await opts.nth(1).boundingBox()
  expect(second.y).toBeGreaterThan(first.y)
})

// ── Selection semantics survive grouping ──────────────────────────────────────

test('single-selection holds within a group', async ({ page }) => {
  const first = page.locator('#cg-above-1')
  const second = page.locator('#cg-above-2')
  await expect(first).toBeChecked()
  await page.locator('label[for="cg-above-2"]').click()
  await expect(second).toBeChecked()
  await expect(first).not.toBeChecked()
})

// ── Accessibility ─────────────────────────────────────────────────────────────

test('no axe violations across the bench', async ({ page }) => {
  await injectAxe(page)
  await scopedCheckA11y(page, '.Bench')
})
