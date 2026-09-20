// THE TYPOGRAPHY FAMILY CONTRACT — the wiring, as data.
//
// Four axes that look like one, kept apart on purpose:
//   1. VOICE            the look bundle: heading, display, body, label, button, preamble
//                       (data-variant, each with its own size stops). Six siblings;
//                       none is a kind of another. Display is not "a heading of type
//                       display", button is not "a kind of label": each pair happens
//                       to share a door (Heading; Caption).
//   2. ELEMENT FARM     the markup shape: h1–h6, p, span, div, legend, figcaption,
//                       label. Semantics pick the element; design picks the voice; the
//                       two never force each other. A legend may be a heading, a
//                       figcaption a label — nested fieldsets in a wizard need every
//                       trick to bind things semantically that look alike.
//   3. INPUT CONTRACT   authored (text prop or child markup, written in code) or
//                       plaintext (a plain multiline string the way a CMS field
//                       delivers it: line breaks respected, sub-markup unrepresentable)
//   4. EMPHASIS LAW     semantic (strong bold, em italic) · flattened (a loud voice
//                       levels inline emphasis, ADR-0012 law b) · none (plaintext).
//                       Semantic is a door, not a promise of bold: strong asks for the
//                       voice's bold weight with one fallback to the voice's own, so a
//                       voice a theme gives one weight (label, button here) flattens by
//                       value, not by law. A theme that adds a bold weight opens the door.
//
// Components are born from axes 2–4, never from voice; voices are then assigned to
// doors. This module is the one place the combinations are declared, and
// tests/typographyFamily.test.ts enforces the door law: for any (voice × element ×
// input shape) there is exactly ONE component to reach for. The recipe tables
// (recipes/heading, text, textblock) are held to these rows cell for cell.
//
// The rows are the UNIVERSE (ADR-0018 §5): a (voice, element) cell is left out only
// when there is no CSS answer for it — never as taste. A project closes cells in its
// own configuration. One choice recorded here rather than pretended to be a law:
// preamble speaks through the plaintext door only. An ingress with an <em> in it
// cannot exist today. When a real case arrives (an RTE-fed standfirst), the change is
// a row under Text plus a decision on its emphasis law, not a rebuild.

/** Law (c), ADR-0012 §3: run mode follows element shape — a span is an inline run
 *  (flows on the line, no trim), every other element a block run. */
export const runOf = (tag: string): "inline" | "block" => (tag === "span" ? "inline" : "block");

export const VOICE_SIZES: Record<string, readonly string[]> = {
  heading: ["1", "2", "3", "4", "5", "6"],
  display: ["1", "2", "3"],
  body: ["sm", "md", "lg"],
  label: ["sm", "md", "lg"],
  button: ["sm", "md", "lg"],
  preamble: ["sm", "md", "lg"],
};

const HEADING_SHAPED = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;
/** every element a loud voice may speak through */
const HEADING_FARM = [...HEADING_SHAPED, "span", "div", "p", "legend", "figcaption"] as const;
/** every element the body voice may speak through outside the heading shapes */
const TEXT_FARM = ["p", "span", "div", "legend", "figcaption", "label"] as const;
/** every element a UI voice may speak through: a legend that must be a heading, a th, a
 *  form label, a figcaption — the whole farm, because forms need every trick to bind
 *  things semantically that look alike */
const CAPTION_FARM = [...HEADING_SHAPED, "p", "span", "div", "legend", "figcaption", "label"] as const;

// The run engine laws (enforced in the components' shared engine CSS):
//   (a) child content passes through the engine container — no path
//       bypasses size/leading/trim
//   (b) inline emphasis (the `emphasis` field): quiet voices keep the
//       semantics (strong → the F2 strong-weight convention, em italic);
//       loud voices flatten — partial bolding of a heading is drift
//   (c) run mode follows element shape: span = inline run (flows on the
//       line, no trim — trim is a block concept), all else = block run
//   (d) voice sovereignty: an unvoiced inline element inherits the run's
//       metrics; a voiced child (data-variant) owns its own bundle —
//       nearest voice wins by inheritance, never by specificity

export interface FamilyMember {
  /** The input contract this component accepts. */
  input: "authored" | "plaintext";
  /** Law (b): how inline strong/em behave inside this component's runs.
      "none" = markup is unrepresentable (the plaintext contract). */
  emphasis: "semantic" | "flattened" | "none";
  /** voice → elements that may speak it through this component. */
  voices: Record<string, readonly string[]>;
}

export const FAMILY: Record<string, FamilyMember> = {
  Heading: {
    input: "authored",
    emphasis: "flattened",
    voices: {
      heading: HEADING_FARM,
      display: HEADING_FARM,
      // The quiet voice on heading-shaped elements only — a body-voiced anything
      // else has ONE door, and it is Text.
      body: HEADING_SHAPED,
    },
  },
  Text: {
    input: "authored",
    emphasis: "semantic",
    voices: {
      body: TEXT_FARM,
    },
  },
  // The UI voices: what marks the interface up — labels, legends, figcaptions, table
  // headers (label) and the pressable thing (button, which Button.css reads as tokens
  // rather than rendering through this door). One door, two sibling voices, like
  // Heading with heading and display.
  Caption: {
    input: "authored",
    emphasis: "semantic",
    voices: {
      label: CAPTION_FARM,
      button: CAPTION_FARM,
    },
  },
  TextBlock: {
    input: "plaintext",
    emphasis: "none",
    voices: {
      preamble: ["p", "div"],
      body: ["p", "div"],
    },
  },
};
