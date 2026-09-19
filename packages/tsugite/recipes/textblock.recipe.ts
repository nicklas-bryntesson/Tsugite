// TextBlock — the table (ADR-0018). The textarea contract: a PLAIN MULTILINE STRING the
// way a CMS field delivers it, never markup. Line breaks survive, runs of spaces collapse,
// sub-typography is unrepresentable — so child content is not merely absent here, it is
// an absent cell: the one condition that makes a TextBlock something else. Voices:
// preamble (the standfirst, default) and body, on p and div. The family matrix
// (lib/typographyFamily.ts) holds this table cell for cell.
import type { Recipe } from "../lib/recipe";

export const textblock = {
  name: "TextBlock",
  promise: "A plain multiline string from a field, set in the preamble or body voice, exactly as delivered.",
  refuses: [
    "child content — markup is unrepresentable in a plain field; that is Text or Prose",
    "inline emphasis — the plaintext contract has no strong and no em",
    "a link — a field is words, not destinations",
  ],
  class: "TextBlock",
  element: { values: ["p", "div"], default: "p" },
  parts: {
    /** the field's string, escaped by the renderer; line breaks are honoured by the CSS */
    text: { kind: "text" },
    /** never filled: the renderer reports it so the table can refuse it */
    children: { kind: "slot" },
  },
  axes: {
    variant: { values: ["preamble", "body"], default: "preamble" },
    size: { valuesBy: { axis: "variant", values: { preamble: ["sm", "md", "lg"], body: ["sm", "md", "lg"] } }, default: "md" },
    align: { values: ["left", "center", "right"], default: "left" },
    wrap: { values: ["balance", "pretty", "stable", "nowrap"], default: "pretty" },
  },
  derived: {
    /** ADR-0012 §3: a span is an inline run; TextBlock has none, so this is always block */
    run: { attr: "data-run", from: ["element"] },
  },
  absent: [{ cells: { children: true }, message: "TextBlock takes plain text only (the textarea contract) — use the text prop, never child content" }],
  content: { empty: "suppress", unless: ["text"] },
} as const satisfies Recipe;
