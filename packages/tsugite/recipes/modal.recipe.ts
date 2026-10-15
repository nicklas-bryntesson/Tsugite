// Modal — the table (ADR-0018). The first region that hears its children through channels
// (ADR-0029): a native <dialog> on the top layer, one slot, no assumptions about what stands
// in it. It never opens itself; a button with command="show-modal", a script calling
// showModal() or a kernel decision opens it. lib/modal.ts holds the two derived values.
import type { Recipe } from "../lib/recipe";

export const modal = {
  name: "Modal",
  promise: "A dialog on the top layer that its content can close, and that never opens itself.",
  refuses: [
    "opening itself — whoever calls it decides when",
    "assumptions about its content — one slot, any tree",
    "a grid of its own — a grid is a component placed inside",
    "strings of its own — every word comes from the content or the caller",
  ],
  class: "Modal",
  element: { values: ["dialog"], default: "dialog" },
  host: {
    /** openers point at it with commandfor */
    "*": { id: "string" },
  },
  axes: {
    /** what may close it besides its content: Esc and light dismiss, Esc only, or nothing */
    dismiss: { values: ["any", "request", "none"], default: "request" },
  },
  derived: {
    /** the native attribute dismiss stands for; the kernel reads it where it is unsupported */
    closedby: { attr: "closedby", from: ["dismiss"] },
    /** the marker that makes it a region its children's channels resolve to (ADR-0029 §1) */
    region: { attr: "data-region", from: [] },
  },
  absent: [{ cells: { id: null }, message: "id is required — openers point at the modal with commandfor" }],
  content: { empty: "suppress" },
} as const satisfies Recipe;
