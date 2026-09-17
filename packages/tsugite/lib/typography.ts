// The typography family — the recipe. Framework-free: resolves a member's props to
// the element, the class, the data-* attributes and the inner container every
// renderer writes out verbatim (ADR-0017). Three members share one machine:
//   Heading   the loud voices (heading, display) plus body on heading elements;
//             a link or highlighted words in the run
//   Text      the quiet voices (body, label) on plain text elements
//   TextBlock the textarea contract: a plain multiline string, never markup
// Element farms and voices come from lib/typographyFamily.ts (the door law); the
// run engine laws are ADR-0012.
import { FAMILY, VOICE_SIZES } from "./typographyFamily.ts";
import { escapeHtml } from "./html";

export type FamilyMemberName = "Heading" | "Text" | "TextBlock";

export const TYPO_ALIGNS = ["left", "center", "right"] as const;
export const TYPO_WRAPS = ["balance", "pretty", "stable", "nowrap"] as const;

const DEFAULTS: Record<FamilyMemberName, { element: string; variant: string; wrap: string; contentClass: string }> = {
  Heading: { element: "h2", variant: "heading", wrap: "balance", contentClass: "heading-text" },
  Text: { element: "p", variant: "body", wrap: "pretty", contentClass: "text-content" },
  TextBlock: { element: "p", variant: "preamble", wrap: "pretty", contentClass: "textblock-content" },
};

const HEADING_DEFAULT_SIZE_BY_VARIANT: Record<string, string> = { display: "2", body: "md" };
const HEADING_ELEMENT_TO_SIZE: Record<string, string> = { h1: "1", h2: "2", h3: "3", h4: "4", h5: "5", h6: "6" };

export interface TypographyInput {
  text?: string | null;
  /** Heading only: comma-separated words wrapped in <mark> */
  highlight?: string | null;
  /** Heading only: the run becomes a link */
  href?: string | null;
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
  container: { tag: "span" | "a"; className: string; href?: string };
  /** the run's HTML when it comes from the text prop (escaped, highlighted); null when children carry it */
  innerHtml: string | null;
}

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Wrap the highlighted words in <mark>, escaping everything. */
export function applyHighlight(text: string, highlight: string): string {
  const words = highlight.split(",").map((w) => w.trim()).filter(Boolean);
  if (words.length === 0) return escapeHtml(text);
  const pattern = words.sort((a, b) => b.length - a.length).map(escapeRegex).join("|");
  const test = new RegExp(`(${pattern})`, "i");
  return text
    .split(new RegExp(`(${pattern})`, "gi"))
    .map((part) => (test.test(part) ? `<mark>${escapeHtml(part)}</mark>` : escapeHtml(part)))
    .join("");
}

export function resolveTypography(member: FamilyMemberName, input: TypographyInput): TypographyResolution {
  const voices = FAMILY[member].voices;
  const validVariants = Object.keys(voices);
  const allElements = [...new Set(Object.values(voices).flat())];
  const d = DEFAULTS[member];

  const hasText = !!input.text;
  const hasHref = !!input.href;
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
  } else if (member === "Heading" && ((hasText && hasChild) || (hasHref && hasChild) || (hasHref && !hasText))) {
    mode = "error";
    errorMessage = "invalid combination of text, href, and child content";
  } else if (member === "Text" && hasText && hasChild) {
    mode = "error";
    errorMessage = "use text OR child content, not both";
  }

  const variant = validVariants.includes((input.variant ?? "").toLowerCase()) ? input.variant!.toLowerCase() : d.variant;
  const elementProp = (input.element ?? d.element).toLowerCase();
  // TextBlock picks its element from the voice's own farm; the others from the member's farm
  const element = (member === "TextBlock" ? voices[variant] : allElements).includes(elementProp) ? elementProp : d.element;

  if (mode === "render" && member === "Heading" && !voices[variant].includes(element)) {
    mode = "error";
    errorMessage = `variant "${variant}" does not allow element "${element}"`;
  }

  const sizeProp = input.size?.toLowerCase();
  let size: string | undefined;
  if (sizeProp && VOICE_SIZES[variant]?.includes(sizeProp)) size = sizeProp;
  else if (member === "Heading") size = HEADING_DEFAULT_SIZE_BY_VARIANT[variant] ?? (variant === "heading" ? HEADING_ELEMENT_TO_SIZE[element] ?? "2" : undefined);
  else size = "md";

  // TODO(decide): an invalid align or wrap drops the attribute silently; Card raises a
  // dev error for an invalid padding. Two policies for invalid input.
  const align = (input.align ?? "left").toLowerCase();
  const wrap = (input.wrap ?? d.wrap).toLowerCase();

  // ADR-0012 §3: a span is an inline run; every other element is a block run.
  const run = element === "span" ? "inline" : "block";

  const attrs: Record<string, string> = { "data-variant": variant };
  if (size) attrs["data-size"] = size;
  attrs["data-run"] = run;
  if ((TYPO_ALIGNS as readonly string[]).includes(align)) attrs["data-align"] = align;
  if ((TYPO_WRAPS as readonly string[]).includes(wrap)) attrs["data-wrap"] = wrap;

  const isLink = member === "Heading" && hasHref && hasText && !hasChild;
  const container: TypographyResolution["container"] = isLink
    ? { tag: "a", className: "heading-link", href: input.href! }
    : { tag: "span", className: d.contentClass };

  let innerHtml: string | null = null;
  if (mode === "render" && !hasChild && hasText) {
    innerHtml = member === "Heading" && input.highlight ? applyHighlight(input.text!, input.highlight) : escapeHtml(input.text!);
  }

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
