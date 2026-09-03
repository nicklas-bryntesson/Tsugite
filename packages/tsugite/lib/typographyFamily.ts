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

export interface FamilyMember {
  /** The input contract this component accepts. */
  input: "authored" | "plaintext";
  /** voice → elements that may speak it through this component. */
  voices: Record<string, readonly string[]>;
}

export const FAMILY: Record<string, FamilyMember> = {
  Heading: {
    input: "authored",
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
    voices: {
      body: ["p", "span", "div"],
      label: ["p", "span", "div"],
    },
  },
  TextBlock: {
    input: "plaintext",
    voices: {
      preamble: ["p", "div"],
      body: ["p", "div"],
    },
  },
};
