// The field state map (tasks/plan-fields.md): the probe's reading in Chromium, Firefox and
// WebKit, and the reasoning where the probe cannot reach (autofill is a manual reading).
// The Input bench draws it; the next fields reuse it.
import type { StateMap } from "./types";

export const fieldStates: StateMap = {
  base: { value: "A value" },
  states: [
    { key: "hover", label: "hover", props: { "data-test-state": "hover" } },
    { key: "autofill", label: "autofill", props: { "data-test-state": "autofill", value: "you@example.com" } },
    { key: "focus", label: "focus", props: { "data-test-state": "focus" } },
    { key: "invalid", label: "invalid", props: { "aria-invalid": "true", value: "not an address" } },
    { key: "readonly", label: "read-only", props: { readonly: true } },
    { key: "disabled", label: "disabled", props: { disabled: true } },
    { key: "empty", label: "empty", props: { value: null, placeholder: "A placeholder" } },
  ],
  pairs: {
    "hover+autofill": { reach: "yes" },
    "hover+focus": { reach: "yes" },
    "hover+invalid": { reach: "yes" },
    "hover+readonly": { reach: "yes" },
    "hover+disabled": { reach: "yes", note: ":hover matches a disabled input in all three engines" },
    "hover+empty": { reach: "yes" },
    "autofill+focus": { reach: "yes" },
    "autofill+invalid": { reach: "yes", note: "a filled value can fail the field's rules" },
    "autofill+readonly": { reach: "unknown", note: "does an engine fill a read-only field? read by hand" },
    "autofill+disabled": { reach: "unknown", note: "does :autofill survive a script disabling the field? read by hand" },
    "autofill+empty": { reach: "no", note: "an autofilled field has a value" },
    "focus+invalid": { reach: "yes" },
    "focus+readonly": { reach: "yes" },
    "focus+disabled": { reach: "no", note: "a disabled field takes no focus" },
    "focus+empty": { reach: "yes" },
    "invalid+readonly": { reach: "aria", note: "barred from validation: :invalid never matches" },
    "invalid+disabled": { reach: "aria", note: "barred from validation: :invalid never matches" },
    "invalid+empty": { reach: "yes", note: "a required field left empty" },
    "readonly+disabled": { reach: "yes", note: "both attributes; disabled answers" },
    "readonly+empty": { reach: "yes" },
    "disabled+empty": { reach: "yes" },
  },
  triples: [
    { keys: ["hover", "focus", "invalid"], note: "pointing at the field being corrected" },
    { keys: ["autofill", "focus", "invalid"], note: "a filled value that fails, being corrected" },
    { keys: ["hover", "autofill", "focus"], note: "a filled field in use" },
  ],
};
