// Text — the table (ADR-0018). The reading voice of the typography family, body, on text
// shapes, the form/figure captions and the heading shapes: authored single-run text. The
// UI voices (label, button) have their own door, Caption; the loud voices, Heading. One
// voice, twelve elements, no absent cells (ADR-0023 gave it h1–h6); the
// size set is the voice's, md by default — unlike Heading, the element never decides the
// size. tests/typographyFamily.test.ts holds this table to the family matrix.
//
// The mode is intent (ADR-0024): `inline` says the words sit in a line, the element
// follows — a span by default — and the elements that cannot sit in a line are absent.
// The text-box engine reads the derived data-text-box, never the flag.
import type { Recipe } from "../lib/recipe";

/** the elements that cannot sit in a line: an inline Text refuses them */
const BLOCK_ONLY = ["p", "div", "legend", "figcaption", "h1", "h2", "h3", "h4", "h5", "h6"] as const;

export const text = {
  name: "Text",
  promise: "One run of reading text in the body voice, on a text shape, a caption or a heading shape.",
  refuses: [
    "a link of its own — a link is content inside the run",
    "the UI voices — a label, a legend that looks like one, a button's words: that is Caption",
    "colour of its own — ink comes from the surface's voice",
    "markup it cannot carry — plain multiline strings are TextBlock's contract",
  ],
  class: "Text",
  /** the default follows the mode: a span when inline, a p otherwise */
  element: { values: ["p", "span", "div", "legend", "figcaption", "label", "h1", "h2", "h3", "h4", "h5", "h6"], default: { hole: true } },
  parts: {
    /** the run's words, escaped by the renderer; or child markup through the engine container */
    text: { kind: "text" },
    children: { kind: "slot" },
  },
  axes: {
    /** ADR-0024: the words sit in a line — no box, no trim, no reading ceiling */
    inline: { type: "boolean", default: false, unwritten: true },
    voice: { values: ["body"], default: "body" },
    size: { valuesBy: { axis: "voice", values: { body: ["sm", "md", "lg"] } }, default: "md" },
    alignInline: { values: ["start", "center", "end"], default: "start" },
    wrap: { values: ["balance", "pretty", "stable", "nowrap"], default: "pretty" },
    /** ADR-0021: a reading ceiling on the inline size, the stop's line length; a text in a
        line has no inline size to cap, so the axis exists only when it is not inline */
    capInline: { type: "boolean", default: true, when: { axis: "inline", is: false } },
  },
  derived: {
    /** ADR-0024: the text-box engine's gate, from the intent */
    textBox: { attr: "data-text-box", from: ["inline"] },
  },
  absent: [
    { cells: { text: true, children: true }, message: "use text OR child content, not both" },
    ...BLOCK_ONLY.map((element) => ({ cells: { inline: true, element }, message: `an inline Text sits in a line, and ${element} cannot — use span or label` })),
  ],
  content: { empty: "suppress", unless: ["text"] },
} as const satisfies Recipe;
