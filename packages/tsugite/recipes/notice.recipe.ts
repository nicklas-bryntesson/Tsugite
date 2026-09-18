// Notice — the table (ADR-0018). A message with a severity. It INFORMS: it owns no live
// role (the host's region announces), no lifetime (the host places a dismiss control and
// owns what it does) and no destination (a notice that is a link is a Banner). The icon
// per severity is the one table the schema has no field for; lib/notice.ts holds it.
import type { Recipe } from "../lib/recipe";

export const notice = {
  name: "Notice",
  promise: "Informs: one message with a severity. It owns no live role, no lifetime and no destination.",
  refuses: [
    "a live role — the host's region announces it",
    "dismissal logic — the host owns lifetime; Notice only places the control",
    "a destination of its own — a notice that is a link is a Banner",
    "several severities",
  ],
  class: "Notice",
  element: { values: ["div"], default: "div" },
  parts: {
    /** an optional bold title above the body */
    title: { kind: "text" },
    /** the message: the default slot */
    body: { kind: "slot" },
    /** buttons the host places under the body; Notice arranges them, the host sizes them */
    actions: { kind: "slot" },
    /** the dismiss control the host places in the top-end corner; the host owns what it does */
    dismiss: { kind: "slot" },
  },
  axes: {
    variant: { values: ["error", "warning", "success", "info", "neutral"], default: "neutral" },
    /** the icon and its column; severity is carried by the icon, never by chrome alone */
    icon: { type: "boolean", default: true },
    /** a full border in the accent colour */
    border: { type: "boolean", default: false },
    /** a stronger visual weight: the leading accent bar */
    emphasis: { type: "boolean", default: false },
    /** may the box take more inline space than its content? (ADR-0015) */
    growInline: { type: "boolean", default: true },
    /** is there a reading ceiling on the inline size? (ADR-0015) */
    capInline: { type: "boolean", default: true },
  },
  derived: {
    hasActions: { attr: "data-actions", from: ["actions"] },
    hasDismiss: { attr: "data-dismiss", from: ["dismiss"] },
  },
  content: { empty: "render" },
} as const satisfies Recipe;
