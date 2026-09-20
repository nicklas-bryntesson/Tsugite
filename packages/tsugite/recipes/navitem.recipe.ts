// NavItem — the table (ADR-0018). One item of a site's navigation: a LINK (<a>) that takes
// the reader somewhere within the site, or a BUTTON (<button>) that opens the next level
// of it. Button's shape exactly: one table, `element` as the gate, two front doors. What
// the two share is the nav voice, the states and `current` — a disclosure that contains
// the current page is current too. What only the link says is aria-current; what only the
// button says is aria-expanded, written as derived attributes that are present or not.
import type { Recipe } from "../lib/recipe";

export const navitem = {
  name: "NavItem",
  promise: "Takes the reader somewhere within the site, or opens the next level of it, and knows where they are.",
  refuses: ["an action — a thing that does something is a Button", "several destinations", "being the menu — Nav arranges items; this is one"],
  class: "NavItem",
  element: { values: ["a", "button"], required: true },
  host: {
    a: {
      href: "string",
      target: { type: "string", implies: { _blank: { rel: "noopener noreferrer" } } },
    },
    button: {
      type: { default: "button" },
      /** the disclosure this button opens */
      "aria-controls": "string",
    },
    "*": { "aria-label": "string" },
  },
  parts: {
    text: { kind: "slot" },
    icon: { kind: "name", attr: "data-icon" },
  },
  axes: {
    size: { values: ["sm", "md", "lg"], default: "md" },
    /** here you are: the current page, or the branch that contains it */
    current: { type: "boolean", default: false },
    /** the disclosure is open; only a button opens one */
    expanded: { type: "boolean", default: false, when: { element: "button" } },
    iconPosition: { values: ["left", "right"], default: "right", when: { part: "icon" } },
  },
  derived: {
    /** aria-current="page" on a current link; a button is never the page */
    ariaCurrent: { attr: "aria-current", from: ["current", "element"] },
    /** aria-expanded on a button, always, true or false; never on a link */
    ariaExpanded: { attr: "aria-expanded", from: ["expanded", "element"] },
  },
  content: { empty: "suppress", unless: ["aria-label"] },
} as const satisfies Recipe;
