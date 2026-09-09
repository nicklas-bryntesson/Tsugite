import { test, expect } from '@playwright/test'
import { checkA11y, injectAxe } from 'axe-playwright'
import { targetPath, targetId } from './helpers/target.js'

// Tsugite adaptation (INTAKE §3, mechanical): the root is `.ToggleTip[data-component]`,
// not the `toggle-tip` custom element — the DOM end-state is authored in
// ToggleTip.astro. Every other selector, attribute and assertion is upstream's.
const tipRoot = (id) => `${targetId('ToggleTip')}[data-id="${id}"]`

test.beforeEach(async ({ page }) => {
  await page.goto(targetPath())
})

// ── Open / close ───────────────────────────────────────────────────────────

test('opens on button click', async ({ page }) => {
  const tip = page.locator(tipRoot('inline'))
  await tip.scrollIntoViewIfNeeded()
  const button = tip.locator('button')
  const popup = tip.locator('.popup')

  await expect(popup).not.toBeVisible()
  await button.click()
  await expect(popup).toBeVisible()
  await expect(button).toHaveAttribute('aria-expanded', 'true')
  await expect(popup).toHaveAttribute('aria-hidden', 'false')
})

test('closes on second click', async ({ page }) => {
  const tip = page.locator(tipRoot('inline'))
  await tip.scrollIntoViewIfNeeded()
  const button = tip.locator('button')

  await button.click()
  await button.click()
  await expect(tip.locator('.popup')).not.toBeVisible()
  await expect(button).toHaveAttribute('aria-expanded', 'false')
})

test('closes on click outside', async ({ page }) => {
  const tip = page.locator(tipRoot('inline'))
  await tip.scrollIntoViewIfNeeded()
  await tip.locator('button').click()
  await expect(tip.locator('.popup')).toBeVisible()

  await page.mouse.click(5, 5)
  await expect(tip.locator('.popup')).not.toBeVisible()
})

// ── Keyboard ────────────────────────────────────────────────────────────────

test('button is keyboard-activatable with Enter', async ({ page }) => {
  const tip = page.locator(tipRoot('inline'))
  await tip.scrollIntoViewIfNeeded()
  await tip.locator('button').focus()
  await page.keyboard.press('Enter')
  await expect(tip.locator('.popup')).toBeVisible()
})

test('focusout closes the tip', async ({ page }) => {
  const tip = page.locator(tipRoot('inline'))
  await tip.scrollIntoViewIfNeeded()
  await tip.locator('button').click()
  await expect(tip.locator('.popup')).toBeVisible()

  // Move focus to body programmatically — no mousedown, no tab-order dependency
  await page.evaluate(() => { document.body.setAttribute('tabindex', '-1'); document.body.focus() })
  await expect(tip.locator('.popup')).not.toBeVisible()
})

test('Escape closes the tip and returns focus to the trigger', async ({ page }) => {
  // Tsugite addition (2026-09-09): the disclosure pattern's keyboard close. The
  // date fields had it; ToggleTip did not, and the shared popup-anchor now does.
  const root = page.locator(tipRoot('inline'))
  await root.scrollIntoViewIfNeeded()
  const button = root.locator('button')
  await button.click()
  await expect(root.locator('.popup')).toBeVisible()

  await page.keyboard.press('Escape')
  await expect(root.locator('.popup')).not.toBeVisible()
  await expect(button).toHaveAttribute('aria-expanded', 'false')
  await expect(button).toBeFocused()
})

// ── Positioning ─────────────────────────────────────────────────────────────

test('bubble is positioned above trigger by default', async ({ page }) => {
  const tip = page.locator(tipRoot('center'))

  // Place the tip well into the lower half of the viewport so there is clearly
  // more room above than below. The bubble's default "above" placement is only
  // chosen when space allows — detectDirection compares available space and a
  // near-centred trigger is an ambiguous tie, so the test must set the scene.
  const absTop = await tip.evaluate(el => window.scrollY + el.getBoundingClientRect().top)
  await page.setViewportSize({ width: 1280, height: 720 })
  await page.evaluate(top => window.scrollTo(0, top - 600), absTop)

  await tip.locator('button').click()
  await expect(tip).toHaveAttribute('data-direction', 'top')

  const tipBox = await tip.boundingBox()
  const bubbleBox = await tip.locator('.popup').boundingBox()
  // bubble bottom edge must be above trigger bottom edge
  expect(bubbleBox.y + bubbleBox.height).toBeLessThan(tipBox.y + tipBox.height)
})

test('bubble flips below trigger when near top of viewport', async ({ page }) => {
  const tip = page.locator(tipRoot('near-top'))

  // Use a short viewport so even a few pixels of space above is less than space below.
  // First get the element's absolute top, then scroll so it sits 4px from the viewport top.
  // Scroll the element close to the viewport top so space above is less than space below.
  const absTop = await tip.evaluate(el => {
    const rect = el.getBoundingClientRect()
    return window.scrollY + rect.top
  })
  await page.setViewportSize({ width: 1280, height: 100 })
  await page.evaluate(top => window.scrollTo(0, top - 4), absTop)

  await tip.locator('button').click()
  await expect(tip).toHaveAttribute('data-direction', 'bottom')

  const tipBox = await tip.boundingBox()
  const bubbleBox = await tip.locator('.popup').boundingBox()

  // Restore viewport before assertions so subsequent tests start clean
  await page.setViewportSize({ width: 1280, height: 720 })

  expect(bubbleBox.y).toBeGreaterThan(tipBox.y)
})

test('bubble does not overflow viewport left edge', async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 600 })
  const tip = page.locator(tipRoot('left-edge'))
  await tip.scrollIntoViewIfNeeded()
  await tip.locator('button').click()

  const bubbleBox = await tip.locator('.popup').boundingBox()
  expect(bubbleBox.x).toBeGreaterThanOrEqual(0)
})

test('bubble does not overflow viewport right edge', async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 600 })
  const tip = page.locator(tipRoot('right-edge'))
  await tip.scrollIntoViewIfNeeded()
  await tip.locator('button').click()

  const bubbleBox = await tip.locator('.popup').boundingBox()
  const viewport = page.viewportSize()
  expect(Math.round(bubbleBox.x + bubbleBox.width)).toBeLessThanOrEqual(viewport.width)
})

// ── Accessibility ────────────────────────────────────────────────────────────

test('no axe violations on closed state', async ({ page }) => {
  const tip = page.locator(tipRoot('center'))
  await tip.scrollIntoViewIfNeeded()
  await injectAxe(page)
  await checkA11y(page, tipRoot('center'))
})

test('no axe violations on open state', async ({ page }) => {
  const tip = page.locator(tipRoot('center'))
  await tip.scrollIntoViewIfNeeded()
  await tip.locator('button').click()
  await injectAxe(page)
  // `color-contrast` used to be disabled here, with a measured reason: axe could
  // not resolve CSS custom properties on custom elements and reported #888888
  // instead of the computed rgb(0,0,0). Re-measured — it passes with the rule
  // enabled, so the axe limitation is gone and the suppression was only still
  // standing down a rule that now works.
  await checkA11y(page, tipRoot('center'))
})
