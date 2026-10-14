// ItemGrid's suite: the remainder rules, measured. Each bench grid is set to a width in
// each column state (ADR-0028: one column below 36rem, two to 60rem, three above) and every
// item's start column and span over the twelve tracks is read from its box and compared to
// the rule written out below in plain terms. A list keeps its list role; axe audits it.
import { test, expect } from '@playwright/test'
import { injectAxe } from 'axe-playwright'
import { targetPath, scopedCheckA11y } from './helpers/target.js'

const WIDTHS = { 1: '30rem', 2: '48rem', 3: '64rem' }
const COUNTS = [1, 2, 3, 4, 5, 7]
const REMAINDERS = ['balance', 'split', 'fill', 'inset', 'center', 'start']

// The rule as a list of [start | null, span] per item; null = placed by the auto-flow.
function rule(columns, remainder, count) {
  const full = 12 / columns
  const items = Array.from({ length: count }, () => [null, full])
  if (columns === 1) return items
  const left = count % columns
  const last = (n) => items.slice(count - n)
  const first = (n) => items.slice(0, n)
  const set = (list, value) => list.forEach((item, i) => (item.splice(0, 2, ...(Array.isArray(value[0]) ? value[i] : value))))

  if (columns === 2 && left === 1) {
    if (remainder === 'balance' || remainder === 'fill') set(last(1), [1, 12])
    if (remainder === 'split') set(first(1), [1, 12])
    if (remainder === 'inset') set(last(1), [2, 10])
    if (remainder === 'center') set(last(1), [4, 6])
  }
  if (columns === 3 && count === 1 && (remainder === 'balance' || remainder === 'split')) set(items, [1, 12])
  else if (columns === 3 && left === 1) {
    if (remainder === 'balance') set(last(4), [null, 6])
    if (remainder === 'split') {
      set(first(2), [null, 6])
      set(last(2), [null, 6])
    }
    if (remainder === 'fill') set(last(1), [1, 12])
    if (remainder === 'inset') set(last(1), [2, 10])
    if (remainder === 'center') set(last(1), [5, 4])
  } else if (columns === 3 && left === 2) {
    if (remainder === 'balance' || remainder === 'fill') set(last(2), [null, 6])
    if (remainder === 'split') set(first(2), [null, 6])
    if (remainder === 'inset') set(last(2), [[2, 5], [null, 5]])
    if (remainder === 'center') set(last(2), [[3, 4], [null, 4]])
  }
  return items
}

// Grid auto-placement, read as columns only: an explicit start is where the item stands;
// an auto-placed span that does not fit the row wraps to the next.
function place(items) {
  let cursor = 1
  return items.map(([start, span]) => {
    if (start !== null) {
      cursor = start + span
      return [start, span]
    }
    if (cursor + span > 13) cursor = 1
    const at = cursor
    cursor += span
    return [at, span]
  })
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1400, height: 900 })
  await page.goto(targetPath('/item-grid'))
})

for (const [columns, width] of Object.entries(WIDTHS)) {
  for (const remainder of REMAINDERS) {
    for (const count of COUNTS) {
      test(`${columns} column(s) · ${remainder} · ${count} item(s)`, async ({ page }) => {
        const grid = page.locator(`[data-bench-case="${remainder}/${count}"]`)
        const measured = await grid.evaluate((el, w) => {
          el.style.inlineSize = w
          const box = el.getBoundingClientRect()
          const gap = parseFloat(getComputedStyle(el).columnGap)
          const track = (box.width - 11 * gap) / 12
          return [...el.children].map((item) => {
            const r = item.getBoundingClientRect()
            return [Math.round((r.left - box.left) / (track + gap)) + 1, Math.round((r.width + gap) / (track + gap))]
          })
        }, width)
        expect(measured).toEqual(place(rule(Number(columns), remainder, count)))
      })
    }
  }
}

test('a list keeps its list role; a div has none', async ({ page }) => {
  await expect(page.locator('[data-bench-case="balance/3"]')).toHaveAttribute('role', 'list')
  await expect(page.locator('[data-bench-case="div/5"]')).not.toHaveAttribute('role')
})

test('the grid passes axe', async ({ page }) => {
  await injectAxe(page)
  await scopedCheckA11y(page, '[data-bench-case="balance/3"]')
})
