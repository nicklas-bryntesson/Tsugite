// The field contracts: height and validity.
//
// The field height contract (tasks/plan-fields.md): an Input stands on a Button md's
// height, on the native text-box and on the forced fallback, in every engine. The
// tolerance is ten times the measured native/fallback drift of the button (0.01px) and
// far below a visible step.
import { test, expect } from '@playwright/test'

const TOLERANCE = 0.1

test('field height: an Input is a Button md tall, native and fallback @engines', async ({ page }) => {
  await page.goto('/docs/input')
  for (const side of ['native', 'fallback']) {
    const row = page.locator(`[data-height-row="${side}"]`)
    const field = await row.locator('.Input').boundingBox()
    const button = await row.locator('.Button').boundingBox()
    expect(Math.abs(field.height - button.height), `${side}: Input ${field.height}px against Button md ${button.height}px`).toBeLessThanOrEqual(TOLERANCE)
  }
})

// The invalid source (tasks/plan-fields.md): the kernel's field-validity script sets
// aria-invalid with :user-invalid's timing — quiet untouched, marked on leave and on
// submit, cleared the moment the value is valid.
test('field validity: aria-invalid on leave, on submit, cleared on correction @engines', async ({ page }) => {
  await page.goto('/docs/input')
  const field = page.locator('#input-validity')
  await expect(field).not.toHaveAttribute('aria-invalid', 'true')

  await field.fill('not an address')
  await field.blur()
  await expect(field, 'marked on leave').toHaveAttribute('aria-invalid', 'true')

  await field.fill('you@example.com')
  await expect(field, 'cleared on correction').not.toHaveAttribute('aria-invalid', 'true')

  await field.fill('')
  await field.blur()
  await page.evaluate(() => document.querySelector('[data-validity-form]').requestSubmit())
  await expect(field, 'marked on submit').toHaveAttribute('aria-invalid', 'true')
})
