// Heading — the table (ADR-0018). The loud voices of the typography family: heading and
// display, plus body on heading-shaped elements. Which voice may speak through which
// element is the family's door law (lib/typographyFamily.ts); tests/typographyFamily.test.ts
// holds this table to it. The size set depends on the voice, and the default size on the
// element — the first is a lookup, the second the hole lib/heading.ts fills.
import type { Recipe } from "../lib/recipe";

export const heading = {
  name: "Heading",
  promise: "One run of words in a loud voice: a heading or a display line, or body on a heading-shaped element.",
  refuses: [
    "partial bolding — a loud voice flattens inline emphasis (ADR-0012 law b)",
    "colour of its own — ink comes from the surface's voice",
    "more than one destination",
  ],
  class: "Heading",
  element: { values: ["h1", "h2", "h3", "h4", "h5", "h6", "span", "div", "p", "legend", "figcaption"], default: "h2" },
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
    variant: { values: ["heading", "display", "body"], default: "heading" },
    size: {
      valuesBy: { axis: "variant", values: { heading: ["1", "2", "3", "4", "5", "6"], display: ["1", "2", "3"], body: ["sm", "md", "lg"] } },
      default: { hole: true },
    },
    align: { values: ["left", "center", "right"], default: "left" },
    wrap: { values: ["balance", "pretty", "stable", "nowrap"], default: "balance" },
    /** ADR-0021: a reading ceiling on the inline size, the stop's line length; only a block
        run has an inline size to cap, so the CSS applies it behind the data-run gate */
    capInline: { type: "boolean", default: true },
    /** how the marked words show; an open list — a value is a row here and a rule in Heading.css */
    highlightStyle: { values: ["mark", "underline"], default: "mark", when: { part: "highlight" } },
  },
  derived: {
    /** ADR-0012 §3: a span is an inline run; every other element is a block run */
    run: { attr: "data-run", from: ["element"] },
  },
  absent: [
    // The quiet voice on heading-shaped elements only: a body-voiced anything else has one door, Text.
    { cells: { variant: "body", element: "span" }, message: 'variant "body" does not allow element "span"' },
    { cells: { variant: "body", element: "div" }, message: 'variant "body" does not allow element "div"' },
    { cells: { variant: "body", element: "p" }, message: 'variant "body" does not allow element "p"' },
    { cells: { variant: "body", element: "legend" }, message: 'variant "body" does not allow element "legend"' },
    { cells: { variant: "body", element: "figcaption" }, message: 'variant "body" does not allow element "figcaption"' },
    // One run, one source of words, one destination.
    { cells: { text: true, children: true }, message: "invalid combination of text, href, and child content" },
    { cells: { href: true, children: true }, message: "invalid combination of text, href, and child content" },
    { cells: { href: true, text: null }, message: "invalid combination of text, href, and child content" },
  ],
  content: { empty: "suppress", unless: ["text"] },
} as const satisfies Recipe;
