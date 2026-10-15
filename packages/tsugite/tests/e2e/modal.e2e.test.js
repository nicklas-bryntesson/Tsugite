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

// Opens a bench modal from its opener and waits for the entry to finish, so a measurement
// or an axe audit never samples a frame of the fade (an opacity below 1 fails contrast).
async function open(page, dismiss) {
  await page.locator(`[data-bench-opener="${dismiss}"]`).focus()
  await page.keyboard.press('Enter')
  await expect.poll(() => isOpen(page, dismiss)).toBe(true)
  await page.locator(`#modal-${dismiss}`).evaluate((d) => Promise.all(d.getAnimations({ subtree: true }).map((a) => a.finished)))
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
      await expect(page.locator('[data-bench-inner-region]')).toBeHidden()
      await expect(page.locator('[data-bench-inner-status]')).toContainText('closed itself')
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

test.describe('the layer holds real shapes', () => {
  const box = (locator) => locator.evaluate((el) => {
    const r = el.getBoundingClientRect()
    return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width, height: r.height }
  })

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto(targetPath('/modal'))
  })

  test('the modal is a layer over the whole viewport, with no surface of its own', async ({ page }) => {
    await open(page, 'request')
    const layer = await box(page.locator('#modal-request'))
    expect(layer).toMatchObject({ left: 0, top: 0, height: 800 })
    // as wide as the page's content: where scrollbars take space (Linux CI) the locked
    // page keeps its gutter and the layer sits inside it, with no gutter of its own — so a
    // grid inside lines up with the page's
    // (the root's box, not its clientWidth: a locked root reports the full viewport there)
    const widths = await page.locator('#modal-request').evaluate((d) => ({ page: document.documentElement.getBoundingClientRect().width, inner: d.clientWidth }))
    expect(layer.width).toBe(widths.page)
    expect(widths.inner).toBe(widths.page)
    const ground = await page.locator('#modal-request').evaluate((d) => getComputedStyle(d).backgroundColor)
    expect(ground).toBe('rgba(0, 0, 0, 0)')
  })

  test('signup: the form stands on the middle four of twelve columns', async ({ page }) => {
    await open(page, 'signup')
    const layout = page.locator('#modal-signup .bench-layout')
    const tracks = await layout.evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(' ').length)
    expect(tracks).toBe(12)
    const card = await box(page.locator('[data-bench-signup-card]'))
    const grid = await box(layout)
    // the middle four: as far from the grid's start as from its end
    expect(Math.abs((card.left - grid.left) - (grid.right - card.right))).toBeLessThan(1)
    expect(card.width).toBeLessThan(grid.width / 2)
  })

  test('long: the layer scrolls, the page behind it does not', async ({ page }) => {
    await open(page, 'long')
    const layer = page.locator('#modal-long')
    expect(await layer.evaluate((d) => d.scrollHeight > d.clientHeight)).toBe(true)
    // it opens at the top: with no autofocus in it the modal took focus, not the button at the end
    await expect(layer).toBeFocused()
    expect(await layer.evaluate((d) => d.scrollTop)).toBe(0)
    await page.mouse.move(640, 400)
    await page.mouse.wheel(0, 600)
    await expect.poll(() => layer.evaluate((d) => d.scrollTop)).toBeGreaterThan(0)
    expect(await page.evaluate(() => scrollY)).toBe(0)
    await page.locator('[data-bench-close="long"]').click()
    expect(await isOpen(page, 'long')).toBe(false)
  })

  test('long: a text selection dragged out onto the layer does not close it', async ({ page }) => {
    await open(page, 'long')
    const text = await box(page.locator('#modal-long .Text').first())
    await page.mouse.move(text.left + 10, text.top + 5)
    await page.mouse.down()
    await page.mouse.move(5, text.top + 5)
    await page.mouse.up()
    expect(await isOpen(page, 'long')).toBe(true)
    await page.mouse.click(5, 5)
    expect(await isOpen(page, 'long')).toBe(false)
  })

  test('drawer: a child at the inline end, the full height of the layer', async ({ page }) => {
    await open(page, 'drawer')
    const layer = await page.locator('#modal-drawer').evaluate((d) => ({ inner: d.clientWidth, height: d.clientHeight }))
    const drawer = await box(page.locator('[data-bench-drawer]'))
    expect(Math.abs(drawer.right - layer.inner)).toBeLessThan(1)
    expect(Math.abs(drawer.height - layer.height)).toBeLessThan(1)
  })

  test('banner: at the block end, closed only by its own choice', async ({ page }) => {
    await open(page, 'banner')
    const banner = await box(page.locator('[data-bench-banner]'))
    expect(banner.bottom).toBeGreaterThan(700)
    await page.keyboard.press('Escape')
    await page.mouse.click(5, 5)
    expect(await isOpen(page, 'banner')).toBe(true)
    await page.getByRole('button', { name: 'Accept' }).click()
    expect(await page.locator('#modal-banner').evaluate((d) => d.returnValue)).toBe('accepted')
  })
})

test.describe('backdrop and motion', () => {
  const animations = (page, id) => page.locator(`#${id}`).evaluate((d) => d.getAnimations({ subtree: true }).length)

  test('the backdrop is the modal\'s own, not the engine\'s default', async ({ page }) => {
    await page.goto(targetPath('/modal'))
    await open(page, 'request')
    const backdrop = await page.locator('#modal-request').evaluate((d) => getComputedStyle(d, '::backdrop').backgroundColor)
    expect(backdrop).not.toBe('rgba(0, 0, 0, 0.1)')
    expect(backdrop).not.toBe('rgba(0, 0, 0, 0)')
  })

  test('it moves in and out; the leaving layer does not catch the next click', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.goto(targetPath('/modal'))
    await page.locator('[data-bench-opener="request"]').click()
    expect(await animations(page, 'modal-request')).toBeGreaterThan(0)
    await page.waitForTimeout(400)
    await page.locator('#modal-request [data-channel="close"]').first().click()
    // Chromium keeps the dialog in the top layer while it leaves (overlay)
    expect(await animations(page, 'modal-request')).toBeGreaterThan(0)
    await page.locator('[data-bench-opener="any"]').click()
    expect(await isOpen(page, 'any')).toBe(true)
  })

  test('a centred child keeps its size while the layer leaves', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto(targetPath('/modal'))
    await open(page, 'signup')
    const card = page.locator('[data-bench-signup-card]')
    const before = await card.evaluate((el) => el.getBoundingClientRect().height)
    await page.locator('#modal-signup [data-channel="close"]').first().click()
    // a frame into the exit: no longer [open], still displayed
    const during = await card.evaluate((el) => new Promise((done) => requestAnimationFrame(() => done(el.getBoundingClientRect().height))))
    expect(await animations(page, 'modal-signup')).toBeGreaterThan(0)
    expect(during).toBe(before)
  })

  test('under reduced motion nothing moves', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto(targetPath('/modal'))
    await open(page, 'request')
    expect(await animations(page, 'modal-request')).toBe(0)
    await page.locator('#modal-request [data-channel="close"]').first().click()
    expect(await animations(page, 'modal-request')).toBe(0)
  })
})

test('focus: the child\'s autofocus wins; without one the modal takes focus itself', async ({ page }) => {
  await page.goto(targetPath('/modal'))
  await open(page, 'alert')
  await expect(page.locator('[data-bench-gate]')).toBeFocused()
  await page.locator('#modal-alert').evaluate((d) => d.close())
  await open(page, 'request')
  await expect(page.locator('#modal-request')).toBeFocused()
  // Tab goes on into the content
  await page.keyboard.press('Tab')
  await expect(page.locator('#modal-request [data-channel="close"]').first()).toBeFocused()
})

for (const name of ['request', 'alert', 'label', 'signup', 'drawer', 'banner']) {
  test(`an open modal passes axe: ${name}`, async ({ page }) => {
    await page.goto(targetPath('/modal'))
    await open(page, name)
    await injectAxe(page)
    await scopedCheckA11y(page, `#modal-${name}`)
  })
}
