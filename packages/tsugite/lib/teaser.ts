// Teaser — the recipe. Framework-free: resolves props to the frame (as Card props),
// the element, the attributes and the content plan every renderer follows (ADR-0017).
// Teaser TRANSPORTS the reader to one destination: the whole card is the link, or a
// button is. It refuses forms, carts and several destinations.

export const TEASER_ELEMENTS = ["article", "div", "li", "section"] as const;
// TODO(decide): should the permitted frames be defined in the theme setup (JS) rather
// than in the component? Same question as Card's FORBIDDEN_COMBINATIONS, but this is a
// POSITIVE list. Direction: the brand forbids, the component guards, so this should
// become a negative list too.
export const TEASER_FRAMES = ["bordered", "elevated", "bare"] as const;

export interface TeaserInput {
  heading?: string | null;
  href?: string | null;
  excerpt?: string | null;
  button?: boolean;
  buttonLabel?: string;
  frame?: string;
  element?: string;
  hasMedia: boolean;
  hasChildContent: boolean;
}

export interface TeaserResolution {
  mode: "render" | "error";
  errorMessage: string;
  tag: (typeof TEASER_ELEMENTS)[number];
  frame: (typeof TEASER_FRAMES)[number];
  /** the Card the frame is; null for bare */
  card: { element: "div"; padding: "none"; border: boolean; elevation: "sm" | "none" } | null;
  /** in write order */
  attrs: Record<string, string>;
  hasHeading: boolean;
  /** the heading is the stretched link (no button, has href) */
  headingIsLink: boolean;
  hasExcerpt: boolean;
  hasBody: boolean;
  button: boolean;
  buttonLabel: string;
}

export function resolveTeaser(input: TeaserInput): TeaserResolution {
  const button = input.button ?? false;
  const hasHref = !!input.href?.trim();
  const hasHeading = !!input.heading?.trim();
  const hasExcerpt = !!input.excerpt?.trim();
  const frameProp = (input.frame ?? "bordered").toLowerCase();
  const elementProp = (input.element ?? "article").toLowerCase();

  const frame = ((TEASER_FRAMES as readonly string[]).includes(frameProp) ? frameProp : "bordered") as TeaserResolution["frame"];
  const tag = ((TEASER_ELEMENTS as readonly string[]).includes(elementProp) ? elementProp : "article") as TeaserResolution["tag"];

  let mode: TeaserResolution["mode"] = "render";
  let errorMessage = "";
  if (button && !hasHref) {
    mode = "error";
    errorMessage = 'button="true" requires href';
  }

  return {
    mode,
    errorMessage,
    tag,
    frame,
    // Teaser owns the permitted Card combinations; bare renders no frame at all.
    card: frame === "bare" ? null : { element: "div", padding: "none", border: frame !== "elevated", elevation: frame === "elevated" ? "sm" : "none" },
    attrs: {
      "data-button": button ? "true" : "false",
      "data-media": input.hasMedia ? "true" : "false",
    },
    hasHeading,
    headingIsLink: hasHref && !button,
    hasExcerpt,
    hasBody: hasExcerpt || input.hasChildContent || button,
    button,
    buttonLabel: input.buttonLabel ?? "Read more",
  };
}
