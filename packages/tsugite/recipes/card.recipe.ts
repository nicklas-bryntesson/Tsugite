// Card — the table (ADR-0018). A visual frame around other components: an element,
// three axes, nothing else. lib/recipe.ts reads it; Card.astro, Card.tsx and Card.vue
// render what it says. No logic lives here, and none may.
import type { Recipe } from "../lib/recipe";

export const card = {
  name: "Card",
  promise: "A visual frame around other components.",
  refuses: ["content of its own", "meaning — it is not a link, a region or a section"],
  class: "Card",
  element: { values: ["div", "article", "section", "li"], default: "div" },
  axes: {
    border: { type: "boolean", default: false },
    padding: { values: ["none", "sm", "md", "lg"], default: "md" },
    elevation: { values: ["none", "sm", "md", "lg"], default: "none" },
  },
  content: { empty: "suppress" },
} as const satisfies Recipe;
