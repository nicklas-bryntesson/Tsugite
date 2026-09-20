// Caption — the table (ADR-0018). The UI voices of the typography family: label (what
// marks the interface up — labels, legends, figcaptions, table headers, hints), button
// (the pressable voice) and nav (the wayfinding voice). The controls read their voice as
// tokens; this door speaks every UI voice standalone, so the door is total. Three sibling
// voices, one door, like Heading with heading and display. The farm is the
// whole family's: a wizard's legend may need to be a heading semantically and look like a
// label; nothing here forces the element and the voice on each other.
// tests/typographyFamily.test.ts holds this table to the family matrix.
import type { Recipe } from "../lib/recipe";

export const caption = {
  name: "Caption",
  promise: "One run of words in a UI voice: what marks the interface up, on whatever element the semantics need.",
  refuses: [
    "body copy — reading text is Text, a flow is Prose",
    "being the control — Button and the navigation items read their voices; this door only speaks them",
    "colour of its own — ink comes from the surface's voice",
  ],
  class: "Caption",
  element: { values: ["h1", "h2", "h3", "h4", "h5", "h6", "p", "span", "div", "legend", "figcaption", "label"], default: "span" },
  parts: {
    /** the run's words, escaped by the renderer; or child markup through the engine container */
    text: { kind: "text" },
    children: { kind: "slot" },
  },
  axes: {
    variant: { values: ["label", "button", "nav"], default: "label" },
    size: { valuesBy: { axis: "variant", values: { label: ["sm", "md", "lg"], button: ["sm", "md", "lg"], nav: ["sm", "md", "lg"] } }, default: "md" },
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
