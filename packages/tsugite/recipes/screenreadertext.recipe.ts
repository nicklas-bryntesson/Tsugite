// ScreenReaderText — the table (ADR-0018). Words that belong to the accessible name or
// description and nowhere on the screen: the hidden suffix on a button ("Read more" +
// " about Widgets"), the label under an icon, the unit a bare value lacks. Always a span,
// because it is inline text that must not be drawn; no axes, no parts beyond the words.
// It is not the way to hide a control: a native input under a custom one is that
// component's own gate, and a focusable thing that cannot be seen is a trap.
import type { Recipe } from "../lib/recipe";

export const screenReaderText = {
  name: "ScreenReaderText",
  promise: "Words for the accessible name only: read by assistive technology, never drawn.",
  refuses: [
    "a visible run — that is Text or Caption",
    "interactive content — a link, a button or a field inside a hidden span is a focus trap (refused in development)",
    "hiding a control — a native input under a custom control is that component's own gate",
    "emptiness — nothing to say renders nothing",
  ],
  class: "ScreenReaderText",
  element: { values: ["span"], default: "span" },
  parts: {
    /** the words, escaped by the renderer; or child markup */
    text: { kind: "text" },
    children: { kind: "slot" },
  },
  axes: {},
  absent: [{ cells: { text: true, children: true }, message: "use text OR child content, not both" }],
  content: { empty: "suppress", unless: ["text"] },
} as const satisfies Recipe;
