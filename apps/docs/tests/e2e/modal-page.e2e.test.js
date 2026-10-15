import { test, expect } from '@playwright/test'

// The /docs/modal page: every example opens from its button, is named by its own title,
// and stands on a ground of its own over the backdrop. Ids on the page are unique — an
// example's modal and an example's section once shared one.

const EXAMPLES = [
  { id: 'delete', name: 'Delete everything?' },
  { id: 'terms-of-use', name: 'Terms' },
  { id: 'filters', name: 'Filters' },
  { id: 'consent', name: 'Cookies' },
  { id: 'welcome', name: 'Välkommen tillbaka' },
]

test.beforeEach(async ({ page }) => {
  await page.goto('/docs/modal')
})

test('no id is used twice on the page', async ({ page }) => {
  const dupes = await page.evaluate(() => {
    const seen = new Map()
    for (const el of document.querySelectorAll('[id]')) seen.set(el.id, (seen.get(el.id) ?? 0) + 1)
    return [...seen].filter(([, n]) => n > 1).map(([id]) => id)
  })
  expect(dupes).toEqual([])
})

for (const { id, name } of EXAMPLES) {
  test(`${id}: opens from its button, named by its title, on a ground of its own`, async ({ page }) => {
    const errors = []
    page.on('pageerror', (e) => errors.push(e.message))
    await page.locator(`[commandfor="${id}"]`).first().click()
    const modal = page.locator(`dialog#${id}`)
    await expect(modal).toHaveJSProperty('open', true)
    await expect(modal).toHaveAccessibleName(name)
    const ground = await modal.locator('.Surface').first().evaluate((el) => getComputedStyle(el).backgroundColor)
    expect(ground).not.toBe('rgba(0, 0, 0, 0)')
    expect(errors).toEqual([])
  })
}
