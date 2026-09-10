// Card — the recipe. Framework-free: resolves props to a tag, a class and the
// data-* attributes every renderer (Card.astro, Card.tsx, …) writes out verbatim.
// The renderers own only content and the host framework's idioms; the contract
// lives here, and tests/card-renderers.test.ts holds the renderers to it.

export const CARD_ELEMENTS = ["div", "article", "section", "li"] as const;
export const CARD_PADDINGS = ["none", "sm", "md", "lg"] as const;
export const CARD_ELEVATIONS = ["none", "sm", "md", "lg"] as const;

// TODO(decide): the guardrail stays; the question is where its rules live. A capability
// map lets every combination of axes be built, but a design also says what may NOT be
// combined (border with elevation, say). Those rules belong to the brand, not to this
// file, so they should come from the theme setup. Direction: a NEGATIVE list (forbidden
// pairs, as here), never a positive one; forbids scale when axes grow, permits do not.
// Every component with combinable axes needs the same hook.
export const CARD_FORBIDDEN_COMBINATIONS: Array<[boolean, string]> = [];

export interface CardInput {
  element?: string;
  padding?: string;
  border?: boolean;
  elevation?: string;
  class?: string;
  /** whether the renderer has content to host; empty cards render nothing */
  hasContent: boolean;
}

export interface CardResolution {
  mode: "render" | "suppress" | "error";
  errorMessage: string;
  tag: (typeof CARD_ELEMENTS)[number];
  className: string;
  /** in write order — renderers keep it, so every renderer emits the same markup */
  attrs: Record<string, string>;
}

export function resolveCard(input: CardInput): CardResolution {
  const elementProp = (input.element ?? "div").toLowerCase();
  const padding = (input.padding ?? "md").toLowerCase();
  const border = input.border ?? false;
  const elevation = (input.elevation ?? "none").toLowerCase();

  const tag = (CARD_ELEMENTS as readonly string[]).includes(elementProp)
    ? (elementProp as CardResolution["tag"])
    : "div";
  const className = input.class && String(input.class).trim() ? `Card ${input.class}` : "Card";

  let mode: CardResolution["mode"] = "render";
  let errorMessage = "";

  if (!input.hasContent) {
    mode = "suppress";
  } else if (!(CARD_PADDINGS as readonly string[]).includes(padding)) {
    mode = "error";
    errorMessage = `invalid padding "${input.padding}" — expected none | sm | md | lg`;
  } else if (!(CARD_ELEVATIONS as readonly string[]).includes(elevation)) {
    mode = "error";
    errorMessage = `invalid elevation "${input.elevation}" — expected none | sm | md | lg`;
  } else if (CARD_FORBIDDEN_COMBINATIONS.some(([b, e]) => b === border && e === elevation)) {
    mode = "error";
    errorMessage = `border="${border}" with elevation="${elevation}" is not a permitted combination`;
  }

  return {
    mode,
    errorMessage,
    tag,
    className,
    attrs: {
      "data-border": border ? "true" : "false",
      "data-padding": padding,
      "data-elevation": elevation,
    },
  };
}
