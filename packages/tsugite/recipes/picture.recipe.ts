// Picture — the table (ADR-0018). A responsive image through a preset: a figure with one
// or more picture elements. The table is small on purpose — the axes of a picture are the
// preset's (crops, widths, art direction) and those are the brand's tables in
// theme-default/media.presets.ts; the plan lib/media.ts builds from them is what the
// renderers write. lib/recipe.ts reads this for the root, the class and the pass-through.
import type { Recipe } from "../lib/recipe";

export const picture = {
  name: "Picture",
  promise: "One image, rendered responsively through a named preset.",
  refuses: ["a caption", "a link", "layout of its own — the preset's figure class is a debt, not a right"],
  class: "Media",
  element: { values: ["figure"], default: "figure" },
  axes: {},
  content: { empty: "render" },
} as const satisfies Recipe;
