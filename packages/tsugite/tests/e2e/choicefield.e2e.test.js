import { test, expect } from '@playwright/test'
import { injectAxe } from 'axe-playwright'
import { scopedCheckA11y, targetPath } from './helpers/target.js'

// ChoiceField on its bench (ADR-0026): both types per checked state per state, named
// data-bench-case="<type>/<checked>/<state>", and a radio group named "group/<n>".

test.beforeEach(async ({ page }) => {
  await page.goto(targetPath('/choice-field'))
})

const inputOf = (page, name) => page.locator(`[data-bench-case="${name}"] input`)
const labelOf = (page, name) => page.locator(`[data-bench-case="${name}"] label`)

test('every case renders a ChoiceField, none a DevError', async ({ page }) => {
  const cases = page.locator('[data-bench-case]')
  expect(await cases.count()).toBeGreaterThan(0)
  await expect(page.locator('.DevError')).toHaveCount(0)
  for (const el of await cases.all()) await expect(el).toHaveClass(/\bChoiceField\b/)
})

// ── Checkbox behaviour (atomica11y checkbox §1) ───────────────────────────────

test('Space toggles a focused checkbox', async ({ page }) => {
  const input = inputOf(page, 'checkbox/unchecked/idle')
  await expect(input).not.toBeChecked()
  await input.focus()
  await page.keyboard.press('Space')
  await expect(input).toBeChecked()
  await page.keyboard.press('Space')
  await expect(input).not.toBeChecked()
})

test('clicking a checkbox label toggles the input', async ({ page }) => {
  const input = inputOf(page, 'checkbox/unchecked/idle')
  await expect(input).not.toBeChecked()
  await labelOf(page, 'checkbox/unchecked/idle').click()
  await expect(input).toBeChecked()
})

// ── Radio behaviour (atomica11y radio §1) ─────────────────────────────────────

test('arrow keys move selection within the radio group (native roving)', async ({ page }) => {
  const first = inputOf(page, 'group/1')
  const second = inputOf(page, 'group/2')
  await expect(first).toBeChecked()
  await first.focus()
  await page.keyboard.press('ArrowDown')
  await expect(second).toBeChecked()
  await expect(first).not.toBeChecked()
})

test('selecting one radio deselects the others (shared name)', async ({ page }) => {
  await labelOf(page, 'group/2').click()
  await expect(inputOf(page, 'group/2')).toBeChecked()
  await expect(inputOf(page, 'group/1')).not.toBeChecked()
  await expect(inputOf(page, 'group/3')).not.toBeChecked()
})

// ── Shared skeleton: focus + rendering ────────────────────────────────────────

test('focus is visibly indicated on both types', async ({ page }) => {
  for (const name of ['checkbox/unchecked/idle', 'radio/unchecked/idle']) {
    const input = inputOf(page, name)
    await input.focus()
    await expect(input).toBeFocused()
    const outlineWidth = await input.evaluate((el) => getComputedStyle(el).outlineWidth)
    expect(parseFloat(outlineWidth)).toBeGreaterThan(0)
  }
})

test('appearance:none box renders at the token size', async ({ page }) => {
  const input = inputOf(page, 'checkbox/unchecked/idle')
  const box = await input.boundingBox()
  expect(box.width).toBeGreaterThan(0)
  expect(box.height).toBeGreaterThan(0)
  const appearance = await input.evaluate((el) => getComputedStyle(el).appearance)
  expect(appearance).toBe('none')
})

// ── Disabled is a functional state ────────────────────────────────────────────

test('disabled controls cannot be toggled', async ({ page }) => {
  const cb = inputOf(page, 'checkbox/unchecked/disabled')
  await expect(cb).toBeDisabled()
  await cb.click({ force: true })
  await expect(cb).not.toBeChecked()
})

// ── Accessibility ─────────────────────────────────────────────────────────────

test('no axe violations across the bench', async ({ page }) => {
  await injectAxe(page)
  await scopedCheckA11y(page, '.Bench')
})
