// The field state probe (tasks/plan-fields.md): which states coexist on a native input, per
// engine. A probe, not a contract — it asserts only the cells the map calls impossible and
// reports the rest, so the run decides the "?" cells. The report is attached per engine
// (field-states-<engine>.json) and printed. Autofill cannot be driven here; read by hand.
import { test, expect } from '@playwright/test'

const READ = () => window.fieldStateProbe()

test('field states: what a native input matches at rest, hovered, focused, both @engines', async ({ page, browserName }, testInfo) => {
  await page.goto('/lab/field-states')
  const ids = Object.keys(await page.evaluate(READ)).filter((id) => !id.startsWith('autofill'))
  const report = {}

  for (const id of ids) {
    const input = page.locator(`#probe-${id}`)
    const at = async () => (await page.evaluate(READ))[id]

    await page.mouse.move(0, 0)
    await page.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur())
    const rest = await at()

    await input.hover({ force: true })
    const hover = await at()

    await page.mouse.move(0, 0)
    // focus through the element: a text input matches :focus-visible on any focus, and a
    // disabled one refuses it
    await page.evaluate((i) => document.getElementById(`probe-${i}`).focus(), id)
    const focus = await at()

    await input.hover({ force: true })
    const both = await at()

    report[id] = { rest, hover, focus, hoverFocus: both }

    // the map's impossible cell: a disabled field takes no focus
    if (rest[':disabled'] === true) expect(focus[':focus'], `${id}: disabled takes focus`).toBe(false)
  }

  const json = JSON.stringify({ engine: browserName, report }, null, 2)
  await testInfo.attach(`field-states-${browserName}.json`, { body: json, contentType: 'application/json' })
  const on = (s) => Object.entries(s).filter(([, v]) => v === true).map(([k]) => k).join(' ')
  console.log(`\n── field states · ${browserName}`)
  for (const [id, r] of Object.entries(report)) console.log(`${id.padEnd(24)} rest: ${on(r.rest)}\n${''.padEnd(24)} hover+focus: ${on(r.hoverFocus)}`)
})
