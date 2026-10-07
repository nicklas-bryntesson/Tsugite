// The button state maps: one per front door, since a link has no disabled. Reasoned, not
// measured — the probe the states spike asks for (TODO(investigate) in Button.css) turns
// each "unknown" into a reading. The Button bench draws them through ButtonCell.astro.
import type { Content, StateMap } from "./types";

const contents: Content[] = [
  { key: "label", label: "Label", props: { label: "Label" } },
  { key: "label-icon", label: "Label and an icon", props: { label: "Label", icon: "icon-search" } },
  { key: "icon", label: "Icon alone", props: { label: null, icon: "icon-search" } },
];

export const actionStates: StateMap = {
  base: { element: "button" },
  contents,
  rest: { key: "idle", label: "idle" },
  states: [
    { key: "hover", label: "hover", props: { "data-test-state": "hover" } },
    { key: "active", label: "active", props: { "data-test-state": "active" } },
    { key: "focus", label: "focus-visible", props: { "data-test-state": "focus" } },
    { key: "disabled", label: "disabled", props: { disabled: true } },
  ],
  pairs: {
    "hover+active": { reach: "yes", note: "a pointer press" },
    "hover+focus": { reach: "yes", note: "reached by keyboard, pointed at" },
    "hover+disabled": { reach: "unknown", note: ":hover on a disabled button differs by engine" },
    "active+focus": { reach: "yes", note: "a held Space" },
    "active+disabled": { reach: "unknown", note: "does any engine match :active on a disabled button?" },
    "focus+disabled": { reach: "no", note: "a disabled button takes no focus" },
  },
  triples: [{ keys: ["hover", "active", "focus"], note: "a held Space under the pointer" }],
};

export const linkStates: StateMap = {
  base: { element: "a" },
  contents,
  rest: { key: "idle", label: "idle" },
  states: [
    { key: "hover", label: "hover", props: { "data-test-state": "hover" } },
    { key: "active", label: "active", props: { "data-test-state": "active" } },
    { key: "focus", label: "focus-visible", props: { "data-test-state": "focus" } },
  ],
  pairs: {
    "hover+active": { reach: "yes", note: "a pointer press" },
    "hover+focus": { reach: "yes", note: "reached by keyboard, pointed at" },
    "active+focus": { reach: "unknown", note: "does Enter on a link match :active?" },
  },
  triples: [{ keys: ["hover", "active", "focus"], note: "a press under the pointer on a link reached by keyboard" }],
};
