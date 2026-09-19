// Text — the table (ADR-0018). The quiet voices of the typography family, body and label,
// on text shapes and the form/figure captions: authored single-run UI text. Both voices
// speak through the same six elements — a legend may look like a label, a figcaption
// like body — so there are no absent cells; the size set is the voice's, md by default
// in both — unlike Heading, the element never decides the size. tests/typographyFamily.test.ts
// holds this table to the family matrix.
import type { Recipe } from "../lib/recipe";

export const text = {
  name: "Text",
  promise: "One run of words in a quiet voice: body or label, on a text shape or a caption.",
  refuses: [
    "a link of its own — a link is content inside the run",
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
    variant: { values: ["body", "label"], default: "body" },
    size: { valuesBy: { axis: "variant", values: { body: ["sm", "md", "lg"], label: ["sm", "md", "lg"] } }, default: "md" },
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
