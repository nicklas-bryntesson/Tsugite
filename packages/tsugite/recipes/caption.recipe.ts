// Caption — the table (ADR-0018). The UI voices of the typography family: label (what
// marks the interface up — labels, legends, figcaptions, table headers, hints), button
// (the pressable voice) and nav (the wayfinding voice). The controls read their voice as
// tokens; this door speaks every UI voice standalone, so the door is total. Three sibling
// voices, one door, like Heading with heading and display. The farm is the
// whole family's: a wizard's legend may need to be a heading semantically and look like a
// label; nothing here forces the element and the voice on each other.
// tests/typographyFamily.test.ts holds this table to the family matrix.
//
// The mode is intent (ADR-0024): `inline` says the words sit in a line, the element
// follows — a span by default, a label allowed — and the elements that cannot sit in a
// line are absent. Otherwise a Caption is a block, a p by default. The text-box engine
// reads the derived data-text-box, never the flag.
import type { Recipe } from "../lib/recipe";

/** the elements of the farm that cannot sit in a line: an inline Caption refuses them */
const BLOCK_ONLY = ["h1", "h2", "h3", "h4", "h5", "h6", "p", "div", "legend", "figcaption"] as const;

export const caption = {
  name: "Caption",
  promise: "One run of words in a UI voice: what marks the interface up, on whatever element the semantics need.",
  refuses: [
    "body copy — reading text is Text, a flow is Prose",
    "being the control — Button and the navigation items read their voices; this door only speaks them",
    "colour of its own — ink comes from the surface's voice",
  ],
  class: "Caption",
  /** the default follows the mode: a span when inline, a p otherwise */
  element: { values: ["h1", "h2", "h3", "h4", "h5", "h6", "p", "span", "div", "legend", "figcaption", "label"], default: { hole: true } },
  parts: {
    /** the run's words, escaped by the renderer; or child markup through the engine container */
    text: { kind: "text" },
    children: { kind: "slot" },
  },
  axes: {
    /** ADR-0024: the words sit in a line — no box, no trim */
    inline: { type: "boolean", default: false, unwritten: true },
    voice: { values: ["label", "button", "nav"], default: "label" },
    size: { valuesBy: { axis: "voice", values: { label: ["sm", "md", "lg"], button: ["sm", "md", "lg"], nav: ["sm", "md", "lg"] } }, default: "md" },
    alignInline: { values: ["start", "center", "end"], default: "start" },
    wrap: { values: ["balance", "pretty", "stable", "nowrap"], default: "pretty" },
  },
  derived: {
    /** ADR-0024: the text-box engine's gate, from the intent */
    textBox: { attr: "data-text-box", from: ["inline"] },
  },
  absent: [
    { cells: { text: true, children: true }, message: "use text OR child content, not both" },
    ...BLOCK_ONLY.map((element) => ({ cells: { inline: true, element }, message: `an inline Caption sits in a line, and ${element} cannot — use span or label` })),
  ],
  content: { empty: "suppress", unless: ["text"] },
} as const satisfies Recipe;
