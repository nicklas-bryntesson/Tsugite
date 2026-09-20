// Text — the table (ADR-0018). The reading voice of the typography family, body, on text
// shapes and the form/figure captions: authored single-run text. The UI voices (label,
// button) have their own door, Caption. One voice, six elements, no absent cells; the
// size set is the voice's, md by default — unlike Heading, the element never decides the
// size. tests/typographyFamily.test.ts holds this table to the family matrix.
import type { Recipe } from "../lib/recipe";

export const text = {
  name: "Text",
  promise: "One run of reading text in the body voice, on a text shape or a caption.",
  refuses: [
    "a link of its own — a link is content inside the run",
    "the UI voices — a label, a legend that looks like one, a button's words: that is Caption",
    "colour of its own — ink comes from the surface's voice",
    "markup it cannot carry — plain multiline strings are TextBlock's contract",
  ],
  class: "Text",
  element: { values: ["p", "span", "div", "legend", "figcaption", "label"], default: "p" },
  parts: {
    /** the run's words, escaped by the renderer; or child markup through the engine container */
    text: { kind: "text" },
    children: { kind: "slot" },
  },
  axes: {
    variant: { values: ["body"], default: "body" },
    size: { valuesBy: { axis: "variant", values: { body: ["sm", "md", "lg"] } }, default: "md" },
    align: { values: ["left", "center", "right"], default: "left" },
    wrap: { values: ["balance", "pretty", "stable", "nowrap"], default: "pretty" },
  },
  derived: {
    /** ADR-0012 §3: a span is an inline run; every other element is a block run */
    run: { attr: "data-run", from: ["element"] },
  },
  absent: [{ cells: { text: true, children: true }, message: "use text OR child content, not both" }],
  content: { empty: "suppress", unless: ["text"] },
} as const satisfies Recipe;
