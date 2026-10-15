// Modal's suite (ADR-0029): an opener opens it, a close channel closes the nearest region
// with a returnValue, focus returns to the opener, and each dismiss value lets exactly the
// right things close it. Every behaviour runs twice: on the platform as it is, and with invoker
// commands and closedby removed before the page loads, so the kernel's fallbacks carry it.
import { test, expect } from '@playwright/test'
import { injectAxe } from 'axe-playwright'
import { targetPath, scopedCheckA11y } from './helpers/target.js'

const WITHOUT_PLATFORM = () => {
  delete HTMLButtonElement.prototype.command
  delete HTMLButtonElement.prototype.commandForElement
  delete HTMLDialogElement.prototype.closedBy
}

const isOpen = (page, dismiss) => page.locator(`#modal-${dismiss}`).evaluate((d) => d.open)

async function open(page, dismiss) {
  await page.locator(`[data-bench-opener="${dismiss}"]`).focus()
  await page.keyboard.press('Enter')
  await expect.poll(() => isOpen(page, dismiss)).toBe(true)
}

for (const platform of ['native', 'fallback']) {
  test.describe(platform, () => {
    test.beforeEach(async ({ page }) => {
      if (platform === 'fallback') await page.addInitScript(WITHOUT_PLATFORM)
      await page.goto(targetPath('/modal'))
      const supported = await page.evaluate(() => 'closedBy' in HTMLDialogElement.prototype)
      expect(supported, 'the fallback run must not see the platform feature').toBe(platform === 'native')
    })

    test('an opener opens it; its close button closes it with a returnValue; focus returns', async ({ page }) => {
      await open(page, 'request')
      await page.locator('#modal-request [data-channel="close"]').first().click()
      expect(await isOpen(page, 'request')).toBe(false)
      expect(await page.locator('#modal-request').evaluate((d) => d.returnValue)).toBe('closed-request')
      await expect(page.locator('[data-bench-opener="request"]')).toBeFocused()
    })

    test('the page does not reload when a close button sits in a form', async ({ page }) => {
      await page.evaluate(() => (window.__mark = 1))
      await open(page, 'request')
      await page.locator('#modal-request [data-bench-close="bare"]').click()
      expect(await page.evaluate(() => window.__mark)).toBe(1)
      expect(await isOpen(page, 'request')).toBe(false)
      expect(await page.locator('#modal-request').evaluate((d) => d.returnValue)).toBe('bare')
    })

    test('dismiss request: Esc closes, the backdrop does not', async ({ page }) => {
      await open(page, 'request')
      await page.mouse.click(5, 5)
      expect(await isOpen(page, 'request')).toBe(true)
      await page.keyboard.press('Escape')
      expect(await isOpen(page, 'request')).toBe(false)
    })

    test('dismiss any: the backdrop closes', async ({ page }) => {
      await open(page, 'any')
      await page.mouse.click(5, 5)
      expect(await isOpen(page, 'any')).toBe(false)
    })

    test('dismiss none: neither Esc nor the backdrop closes; its own button does', async ({ page }) => {
      await open(page, 'none')
      await page.keyboard.press('Escape')
      await page.keyboard.press('Escape')
      await page.mouse.click(5, 5)
      expect(await isOpen(page, 'none')).toBe(true)
      await page.locator('#modal-none [data-channel="close"]').first().click()
      expect(await isOpen(page, 'none')).toBe(false)
    })

    test('a close three layers down closes its modal, with its value', async ({ page }) => {
      await open(page, 'nested')
      await page.locator('[data-bench-close="deep"]').click()
      expect(await isOpen(page, 'nested')).toBe(false)
      expect(await page.locator('#modal-nested').evaluate((d) => d.returnValue)).toBe('deep')
    })

    test('a close inside an inner region reaches the inner region only', async ({ page }) => {
      await open(page, 'nested')
      await page.locator('[data-bench-close="inner"]').click()
      expect(await isOpen(page, 'nested')).toBe(true)
      await expect(page.locator('[data-bench-inner-region]')).toHaveAttribute('data-closed-with', 'inner')
    })
  })
}

test.describe('names and descriptions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(targetPath('/modal'))
  })

  test('a title channel names its modal', async ({ page }) => {
    for (const dismiss of ['any', 'request', 'none']) {
      await open(page, dismiss)
      await expect(page.locator(`#modal-${dismiss}`)).toHaveAccessibleName(`Dismiss: ${dismiss}`)
      await page.locator(`#modal-${dismiss}`).evaluate((d) => d.close())
    }
  })

  test('the title of a region inside the modal names that region, not the modal', async ({ page }) => {
    await open(page, 'nested')
    await expect(page.locator('#modal-nested')).toHaveAccessibleName('Nested')
    const inner = page.locator('[data-bench-inner-region]')
    const titleId = await page.locator('[data-bench-inner-title]').getAttribute('id')
    await expect(inner).toHaveAttribute('aria-labelledby', titleId)
  })

  test('an alert is announced as one, described by its content, and gated by it', async ({ page }) => {
    await open(page, 'alert')
    const alert = page.getByRole('alertdialog')
    await expect(alert).toHaveAccessibleName('Delete everything?')
    await expect(alert).toHaveAccessibleDescription(/to unlock the button/)
    await expect(page.locator('[data-bench-gate]')).toBeFocused()

    const confirm = page.locator('[data-bench-close="confirm"]')
    await expect(confirm).toBeDisabled()
    await page.keyboard.press('Escape')
    expect(await isOpen(page, 'alert')).toBe(true)
    await page.locator('[data-bench-gate]').fill('I know what I am doing')
    await confirm.click()
    expect(await isOpen(page, 'alert')).toBe(false)
    expect(await page.locator('#modal-alert').evaluate((d) => d.returnValue)).toBe('confirmed')
  })

  test('a label names a modal with no visible title', async ({ page }) => {
    await open(page, 'label')
    await expect(page.locator('#modal-label')).toHaveAccessibleName('Product video')
  })

  test('the name keeps the lang of the title it comes from', async ({ page }) => {
    await open(page, 'lang')
    await expect(page.locator('#modal-lang')).toHaveAccessibleName('Välkommen tillbaka')
    const titleId = await page.locator('#modal-lang').getAttribute('aria-labelledby')
    await expect(page.locator(`[id="${titleId}"]`)).toHaveAttribute('lang', 'sv')
  })
})

for (const name of ['request', 'alert', 'label']) {
  test(`an open modal passes axe: ${name}`, async ({ page }) => {
    await page.goto(targetPath('/modal'))
    await open(page, name)
    await injectAxe(page)
    await scopedCheckA11y(page, `#modal-${name}`)
  })
}
