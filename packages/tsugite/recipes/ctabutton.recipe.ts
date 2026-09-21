// CtaButton — the table (ADR-0018). The umbrella for the buttons a designer means when
// they say "but THIS one should…": Button grows only by axes that combine with everything,
// CtaButton grows by VARIANTS — named closed branches, one look each, with their own effect
// layers and CSS. The variant list is a project's to extend; `gradient` is the house's
// first. Same anatomy as Button (element as the gate, two front doors), same button voice
// as tokens: a special button may invent effects, never typography.
import type { Recipe } from "../lib/recipe";

export const ctabutton = {
  name: "CtaButton",
  promise: "One thing to press that asks to be pressed: a link or an action dressed to draw the eye.",
  refuses: ["typography of its own — it reads the button voice", "combining looks — a variant is one look with a name", "a quiet role — that is Button"],
  class: "CtaButton",
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
  },
  axes: {
    /** the look, one name each; a project extends this list with its own */
    variant: { values: ["gradient"], default: "gradient" },
    size: { values: ["md", "lg", "jumbo"], default: "md" },
    /** the cast shadow — the gradient itself, tilted toward the viewer and blurred */
    shadow: { type: "boolean", default: true },
    /** the sheen along the top edge */
    reflection: { type: "boolean", default: true },
    iconPosition: { values: ["left", "right"], default: "right", when: { part: "icon" } },
  },
  content: { empty: "suppress", unless: ["aria-label"] },
} as const satisfies Recipe;
