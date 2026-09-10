// One recipe, three renderers, one CSS: the React- and Vue-rendered Cards on /docs/card
// must carry the same attributes and resolve to the same computed styles as the Astro one.
import { test, expect } from "@playwright/test";

const PROPS = ["borderTopWidth", "borderTopStyle", "borderTopColor", "borderTopLeftRadius", "paddingTop", "boxShadow", "overflow", "display", "flexDirection"];

const styles = (loc) => loc.evaluate((el, props) => { const cs = getComputedStyle(el); return Object.fromEntries(props.map((p) => [p, cs[p]])); }, PROPS);

for (const renderer of ["react", "vue"]) {
  test(`the ${renderer} card shares the Astro card's attributes and computed styles`, async ({ page }) => {
    await page.goto("/docs/card");
    const astro = page.locator('#renderers .Card[data-renderer="astro"]');
    const other = page.locator(`#renderers .Card[data-renderer="${renderer}"]`);
    await expect(astro).toHaveCount(1);
    await expect(other).toHaveCount(1);

    for (const attr of ["data-border", "data-padding", "data-elevation", "class"]) {
      expect(await other.getAttribute(attr), attr).toBe(await astro.getAttribute(attr));
    }
    expect(await styles(other)).toEqual(await styles(astro));
  });
}
