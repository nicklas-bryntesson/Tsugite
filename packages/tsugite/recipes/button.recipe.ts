// Button — the table (ADR-0018). One CSS root, two elements: a LINK (<a>, goes
// somewhere, intent-neutral) and an ACTION (<button>, does something, with intent).
// lib/recipe.ts reads it; LinkButton.astro, ActionButton.astro and Button.tsx render it.
// The one formula it needs — icon-only — is the hole lib/button.ts fills.
import type { Recipe } from "../lib/recipe";

export const button = {
  name: "Button",
  promise: "One thing to press: a link goes somewhere, an action does something, and the two look alike.",
  refuses: ["several destinations", "a menu", "a toggle state of its own", "intent on a link"],
  class: "Button",
  element: { values: ["a", "button"], required: true },
  host: {
    a: {
      href: "string",
      target: { type: "string", implies: { _blank: { rel: "noopener noreferrer" } } },
    },
    button: {
      type: { default: "button" },
      disabled: "boolean",
    },
    "*": { "aria-label": "string" },
  },
  parts: {
    text: { kind: "slot" },
    icon: { kind: "name", attr: "data-icon" },
    /** hidden words before the visible ones — the verb a bare value lacks ("Page ") */
    screenReaderPrefix: { kind: "text" },
    /** hidden words after — the object or the set (" about Widgets", " of 12") */
    screenReaderSuffix: { kind: "text" },
  },
  axes: {
    emphasis: { values: ["primary", "secondary", "tertiary"], default: "primary" },
    intent: { values: ["neutral", "destructive", "success"], default: "neutral", when: { element: "button" } },
    size: { values: ["sm", "md", "lg"], default: "md" },
    pill: { type: "boolean", default: false },
    growInline: { type: "boolean", default: false },
    iconPosition: { values: ["left", "right"], default: "right", when: { part: "icon" } },
  },
  derived: {
    iconOnly: { attr: "data-icon-only", from: ["icon", "text"] },
    /** ADR-0024 §5: the button voice, always — the engine's voice cell fills from it */
    voice: { attr: "data-voice", from: [] },
    /** ADR-0024 §5: a button is never in a line, so the engine's gate is always block —
        written anyway, so the markup reads the same as every other door */
    textBox: { attr: "data-text-box", from: [] },
  },
  absent: [
    // One accessible name per button: an affix builds it around the visible words, aria-label replaces it.
    { cells: { "aria-label": true, screenReaderPrefix: true }, message: "aria-label and a screen-reader affix are two names for one button — use one" },
    { cells: { "aria-label": true, screenReaderSuffix: true }, message: "aria-label and a screen-reader affix are two names for one button — use one" },
    // ADR-0015: a square icon button never spans a row — there is no geometry for it.
    { cells: { iconOnly: true, growInline: true }, message: "icon-only buttons cannot grow: growInline requires a label" },
    // Closed until it has a design: tertiary writes no colour and no hover (Button.css), so
    // it is refused rather than shipped half-made. The coverage page draws the closed cell.
    { cells: { emphasis: "tertiary" }, message: "tertiary is not designed yet — use primary or secondary" },
  ],
  content: { empty: "suppress", unless: ["icon", "aria-label"] },
} as const satisfies Recipe;
