// src/partials/components/ScrollArea/tests/ScrollArea.e2e.test.js
//
// ScrollArea's a11y contract (scrolling-container.md): the viewport is a
// focusable role="region" with an accessible name, scrolled natively by the
// arrow keys once it overflows. The suite runs at a narrow viewport so the
// wide-table demo actually overflows and the region becomes focusable.
import { test, expect } from '@playwright/test'
import { injectAxe } from 'axe-playwright'
import { targetPath, targetId, scopedCheckA11y } from './helpers/target.js'

const SA = targetId('ScrollArea')
const region = (page) => page.locator(`${SA} [data-scroll-viewport]`)

test.beforeEach(async ({ page }) => {
  // Narrow enough that the wide table overflows and the region is enabled.
  await page.setViewportSize({ width: 480, height: 800 })
  await page.goto(targetPath())
  await page.locator(SA).scrollIntoViewIfNeeded()
  await page.locator(`${SA}[data-scrollbar="true"]`).waitFor()
  await injectAxe(page)
})

test('the viewport is a named, focusable scroll region on overflow', async ({ page }) => {
  const r = region(page)
  await expect(r).toHaveAttribute('role', 'region')
  await expect(r).toHaveAttribute('aria-label', /\S/) // has a non-empty accessible name
  await expect(r).toHaveAttribute('tabindex', '0') // focusable because it overflows
})

test('the region is keyboard-scrollable via the arrow keys', async ({ page }) => {
  const r = region(page)
  await r.focus()
  await expect(r).toBeFocused()

  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('ArrowRight')
  await expect(r).not.toHaveJSProperty('scrollLeft', 0) // moved right

  // PORT ADAPTATION: Chrome animates keyboard scrolling, and on a heavier host
  // page the original single read raced the animation — it captured a mid-flight
  // scrollLeft, so "moved back left" compared against a stale number. Under
  // full-suite load two cross-process polls can also read equal mid-flight
  // values, so settle in-page instead: 10 consecutive still animation frames.
  await r.evaluate(
    (el) =>
      new Promise((resolve) => {
        let last = el.scrollLeft
        let still = 0
        const tick = () => {
          if (el.scrollLeft === last) {
            if (++still >= 10) return resolve()
          } else {
            still = 0
            last = el.scrollLeft
          }
          requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      }),
  )
  const scrolled = await r.evaluate((el) => el.scrollLeft)

  await page.keyboard.press('ArrowLeft')
  await expect
    .poll(async () => r.evaluate((el) => el.scrollLeft))
    .toBeLessThan(scrolled) // moved back left
})

test('no axe violations', async ({ page }) => {
  await scopedCheckA11y(page, SA)
})
