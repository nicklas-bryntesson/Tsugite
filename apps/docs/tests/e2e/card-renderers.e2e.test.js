// One recipe, two renderers, one CSS: the React-rendered Card on /docs/card must
// carry the same attributes and resolve to the same computed styles as the Astro one.
import { test, expect } from "@playwright/test";

const PROPS = ["borderTopWidth", "borderTopStyle", "borderTopColor", "borderTopLeftRadius", "paddingTop", "boxShadow", "overflow", "display", "flexDirection"];

test("Astro and React cards share attributes and computed styles", async ({ page }) => {
  await page.goto("/docs/card");
  const astro = page.locator('#renderers .Card[data-renderer="astro"]');
  const react = page.locator('#renderers .Card[data-renderer="react"]');
  await expect(astro).toHaveCount(1);
  await expect(react).toHaveCount(1);

  for (const attr of ["data-border", "data-padding", "data-elevation", "class"]) {
    expect(await react.getAttribute(attr), attr).toBe(await astro.getAttribute(attr));
  }

  const styles = (loc) => loc.evaluate((el, props) => { const cs = getComputedStyle(el); return Object.fromEntries(props.map((p) => [p, cs[p]])); }, PROPS);
  expect(await styles(react)).toEqual(await styles(astro));
});
