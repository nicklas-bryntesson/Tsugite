// Quote — the table (ADR-0018). Attributes words to a source. The element follows the
// content: words alone are an <aside> named by the quote; words with a source or a
// portrait are a <figure> with a <blockquote> and a <figcaption>. That is a default hole
// on the element, filled by lib/quote.ts. The portrait is a Picture; the blurred echo
// behind it is the same image at 64px through the host's resolver — the "second img"
// answer to the blur question in ADR-0018's open list.
import type { Recipe } from "../lib/recipe";

export const quote = {
  name: "Quote",
  promise: "Attributes words to a source: one quotation, said by someone or by no one.",
  refuses: ["body copy — that is Prose", "a link or an action — a quotation goes nowhere", "several quotations", "colour of its own"],
  class: "Quote",
  element: { values: ["aside", "figure"], default: { hole: true } },
  parts: {
    /** the words, as a string; or pass them as children for markup (line breaks, emphasis) */
    quote: { kind: "text" },
    children: { kind: "slot" },
    /** who said it; absent, and without a portrait, the quote is an aside */
    source: { kind: "text" },
    /** the portrait; presence is what the renderer reports */
    media: { kind: "slot", uses: "Picture", with: { preset: "quote", class: "portrait" } },
    /** root id; the aside is labelled by `${id}-quote` */
    id: { kind: "text" },
  },
  axes: {
    /** the size of the words */
    size: { values: ["sm", "md", "lg"], default: "md" },
    /** is the box held to a reading measure? (ADR-0015) */
    capInline: { type: "boolean", default: true },
  },
  derived: {
    hasMedia: { attr: "data-media", from: ["media"] },
    hasSource: { attr: "data-source", from: ["source"] },
    /** the root hook the conformance suites target, as on the Field components; absent without an id */
    dataId: { attr: "data-id", from: ["id"] },
    /** an aside is labelled by its quote; a figure carries its own semantics; absent otherwise */
    labelledBy: { attr: "aria-labelledby", from: ["id", "element"] },
  },
  absent: [
    // A figcaption lives in a figure: an aside cannot carry a source or a portrait.
    { cells: { element: "aside", source: true }, message: "an aside cannot carry a source — leave the element to the content" },
    { cells: { element: "aside", media: true }, message: "an aside cannot carry a portrait — leave the element to the content" },
  ],
  content: { empty: "suppress", unless: ["quote"] },
} as const satisfies Recipe;
