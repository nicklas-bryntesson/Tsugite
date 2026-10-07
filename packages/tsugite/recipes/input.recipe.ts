// Input — the table (ADR-0018). One native text field, the skin on the element itself:
// no box around it, so every state lives on the <input> and nothing mirrors it
// (tasks/plan-fields.md). It speaks the field voice and reads the --color-field-* roles;
// at its one size it stands on a Button md's height. Its validity is aria-invalid, set by
// the kernel's field-validity script on leave and on submit, or by a server.
import type { Recipe } from "../lib/recipe";

/** the native types that are not a text field: each is another control */
const OTHER_CONTROLS = ["checkbox", "radio", "range", "file", "color", "hidden", "submit", "button", "reset", "image"] as const;

export const input = {
  name: "Input",
  promise: "One native text field, styled on the element: the value, its placeholder and its states, nothing around it.",
  refuses: [
    "a label, a hint or an error — that is the Field group around it",
    "a box around the control — affixes are AffixField's",
    "the choice and action types — checkbox, radio, range, file, color, hidden and the buttons are other controls",
    "a size of its own — a field comes in one size, a Button md's height",
  ],
  class: "Input",
  element: { values: ["input"], default: "input" },
  host: {
    input: {
      type: { default: "text" },
      id: "string",
      name: "string",
      value: "string",
      placeholder: "string",
      autocomplete: "string",
      inputmode: "string",
      pattern: "string",
      min: "string",
      max: "string",
      step: "string",
      minlength: "string",
      maxlength: "string",
      required: "boolean",
      disabled: "boolean",
      readonly: "boolean",
      "aria-invalid": "string",
      "aria-describedby": "string",
      "aria-label": "string",
    },
  },
  axes: {},
  derived: {
    /** the field voice, always — the text-box engine's cell gives the skin its leading */
    voice: { attr: "data-voice", from: [] },
  },
  absent: OTHER_CONTROLS.map((type) => ({ cells: { type }, message: `type="${type}" is not a text field — use its own control` })),
  content: { empty: "render" },
} as const satisfies Recipe;
