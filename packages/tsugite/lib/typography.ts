// The typography family — the ADR-0017 resolver for the two members not yet on a table:
//   Text      the quiet voices (body, label) on plain text elements
//   TextBlock the textarea contract: a plain multiline string, never markup
// Heading moved to recipes/heading.recipe.ts + lib/heading.ts (ADR-0018); Text and
// TextBlock follow when touched. Element farms and voices come from
// lib/typographyFamily.ts (the door law); the run engine laws are ADR-0012.
import { FAMILY, VOICE_SIZES } from "./typographyFamily.ts";
import { escapeHtml } from "./html";

export type FamilyMemberName = "Text" | "TextBlock";

export const TYPO_ALIGNS = ["left", "center", "right"] as const;
export const TYPO_WRAPS = ["balance", "pretty", "stable", "nowrap"] as const;

const DEFAULTS: Record<FamilyMemberName, { element: string; variant: string; wrap: string; contentClass: string }> = {
  Text: { element: "p", variant: "body", wrap: "pretty", contentClass: "text-content" },
  TextBlock: { element: "p", variant: "preamble", wrap: "pretty", contentClass: "textblock-content" },
};

export interface TypographyInput {
  text?: string | null;
  element?: string;
  variant?: string;
  size?: string;
  align?: string;
  wrap?: string;
  class?: string;
  /** whether the renderer has child content */
  hasChildContent: boolean;
}

export interface TypographyResolution {
  mode: "render" | "suppress" | "error";
  errorMessage: string;
  tag: string;
  className: string;
  /** in write order — renderers keep it, so every renderer emits the same markup */
  attrs: Record<string, string>;
  /** the engine container's element and class */
  container: { tag: "span"; className: string };
  /** the run's HTML when it comes from the text prop (escaped); null when children carry it */
  innerHtml: string | null;
}

export function resolveTypography(member: FamilyMemberName, input: TypographyInput): TypographyResolution {
  const voices = FAMILY[member].voices;
  const validVariants = Object.keys(voices);
  const allElements = [...new Set(Object.values(voices).flat())];
  const d = DEFAULTS[member];

  const hasText = !!input.text;
  const hasChild = input.hasChildContent;

  let mode: TypographyResolution["mode"] = "render";
  let errorMessage = "";

  if (member === "TextBlock") {
    if (hasChild) {
      mode = "error";
      errorMessage = "TextBlock takes plain text only (the textarea contract) — use the text prop, never child content";
    } else if (!hasText) {
      mode = "suppress";
    }
  } else if (!hasText && !hasChild) {
    mode = "suppress";
  } else if (member === "Text" && hasText && hasChild) {
    mode = "error";
    errorMessage = "use text OR child content, not both";
  }

  const variant = validVariants.includes((input.variant ?? "").toLowerCase()) ? input.variant!.toLowerCase() : d.variant;
  const elementProp = (input.element ?? d.element).toLowerCase();
  // TextBlock picks its element from the voice's own farm; the others from the member's farm
  const element = (member === "TextBlock" ? voices[variant] : allElements).includes(elementProp) ? elementProp : d.element;

  const sizeProp = input.size?.toLowerCase();
  const size = sizeProp && VOICE_SIZES[variant]?.includes(sizeProp) ? sizeProp : "md";

  // TODO(decide): an invalid align or wrap drops the attribute silently; Card raises a
  // dev error for an invalid padding. Two policies for invalid input.
  const align = (input.align ?? "left").toLowerCase();
  const wrap = (input.wrap ?? d.wrap).toLowerCase();

  // ADR-0012 §3: a span is an inline run; every other element is a block run.
  const run = element === "span" ? "inline" : "block";

  const attrs: Record<string, string> = { "data-variant": variant, "data-size": size, "data-run": run };
  if ((TYPO_ALIGNS as readonly string[]).includes(align)) attrs["data-align"] = align;
  if ((TYPO_WRAPS as readonly string[]).includes(wrap)) attrs["data-wrap"] = wrap;

  const container: TypographyResolution["container"] = { tag: "span", className: d.contentClass };

  const innerHtml = mode === "render" && !hasChild && hasText ? escapeHtml(input.text!) : null;

  return {
    mode,
    errorMessage,
    tag: element,
    className: input.class && String(input.class).trim() ? `${member} ${input.class}` : member,
    attrs,
    container,
    innerHtml,
  };
}
