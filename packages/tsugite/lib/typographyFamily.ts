// THE TYPOGRAPHY FAMILY CONTRACT — the wiring, as data.
//
// Components are born from the technical axis (element farms + input
// contracts); voices live in the token grammar. This module is the one
// place the combinations are declared, and tests/typographyFamily.test.ts
// enforces the door law: for any (voice × element × input shape) there is
// exactly ONE component to reach for. Same move as the theme voiceMatrix
// (ADR-0006 §6): a forbidden combination has no row and therefore does
// not exist.
//
// Input shapes:
//   authored   — text prop or child markup, written in code
//   plaintext  — a plain multiline string (the textarea contract):
//                line breaks respected, sub-markup unrepresentable

export const VOICE_SIZES: Record<string, readonly string[]> = {
  heading: ["1", "2", "3", "4", "5", "6"],
  display: ["1", "2", "3"],
  body: ["sm", "md", "lg"],
  label: ["sm", "md", "lg"],
  preamble: ["sm", "md", "lg"],
};

const HEADING_SHAPED = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;
const HEADING_FARM = [...HEADING_SHAPED, "span", "div", "p", "legend", "figcaption"] as const;

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
      // The quiet voice on heading-shaped elements only — a body-voiced
      // p/span/div has ONE door, and it is Text.
      body: [...HEADING_SHAPED, "legend", "figcaption"],
    },
  },
  Text: {
    input: "authored",
    emphasis: "semantic",
    voices: {
      body: ["p", "span", "div"],
      label: ["p", "span", "div"],
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
