// Heading — the table (ADR-0018). The loud voices of the typography family: heading and
// display. Which voice may speak through which
// element is the family's door law (lib/typographyFamily.ts); tests/typographyFamily.test.ts
// holds this table to it. The size set depends on the voice, and the default size on the
// element — the first is a lookup, the second the hole lib/heading.ts fills.
//
// The mode is intent (ADR-0024): `inline` says the words sit in a line, the element
// follows — a span by default — and the elements that cannot sit in a line are absent.
// The text-box engine reads the derived data-text-box, never the flag.
import type { Recipe } from "../lib/recipe";

/** the elements of the farm that cannot sit in a line: an inline Heading refuses them */
const BLOCK_ONLY = ["h1", "h2", "h3", "h4", "h5", "h6", "div", "p", "legend", "figcaption"] as const;

export const heading = {
  name: "Heading",
  promise: "One run of words in a loud voice: a heading or a display line.",
  refuses: [
    "partial bolding — a loud voice flattens inline emphasis (ADR-0012 law b)",
    "colour of its own — ink comes from the surface's voice",
    "more than one destination",
    "the quiet voice — a heading that should read like text is Text on an h-element (ADR-0023)",
  ],
  class: "Heading",
  /** the default follows the mode: a span when inline, an h2 otherwise */
  element: { values: ["h1", "h2", "h3", "h4", "h5", "h6", "span", "div", "p", "legend", "figcaption"], default: { hole: true } },
  parts: {
    /** the run's words, escaped by the renderer; or child markup through the engine container */
    text: { kind: "text" },
    children: { kind: "slot" },
    /** the run becomes a link */
    href: { kind: "text" },
    /** comma-separated words to mark */
    highlight: { kind: "text" },
  },
  axes: {
    /** ADR-0024: the words sit in a line — no box, no trim, no reading ceiling */
    inline: { type: "boolean", default: false, unwritten: true },
    variant: { values: ["heading", "display"], default: "heading" },
    size: {
      valuesBy: { axis: "variant", values: { heading: ["1", "2", "3", "4", "5", "6"], display: ["1", "2", "3"] } },
      default: { hole: true },
    },
    alignInline: { values: ["start", "center", "end"], default: "start" },
    wrap: { values: ["balance", "pretty", "stable", "nowrap"], default: "balance" },
    /** ADR-0021: a reading ceiling on the inline size, the stop's line length; a heading in
        a line has no inline size to cap, so the axis exists only when it is not inline */
    capInline: { type: "boolean", default: true, when: { axis: "inline", is: false } },
    /** how the marked words show; an open list — a value is a row here and a rule in Heading.css */
    highlightStyle: { values: ["mark", "underline"], default: "mark", when: { part: "highlight" } },
  },
  derived: {
    /** ADR-0024: the text-box engine's gate, from the intent */
    textBox: { attr: "data-text-box", from: ["inline"] },
  },
  absent: [
    // One run, one source of words, one destination.
    { cells: { text: true, children: true }, message: "invalid combination of text, href, and child content" },
    { cells: { href: true, children: true }, message: "invalid combination of text, href, and child content" },
    { cells: { href: true, text: null }, message: "invalid combination of text, href, and child content" },
    ...BLOCK_ONLY.map((element) => ({ cells: { inline: true, element }, message: `an inline Heading sits in a line, and ${element} cannot — use span` })),
  ],
  content: { empty: "suppress", unless: ["text"] },
} as const satisfies Recipe;
