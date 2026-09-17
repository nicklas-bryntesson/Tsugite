// Quote — the recipe. Framework-free: resolves props to the element, the class, the
// data-* attributes and the ids every renderer writes out verbatim (ADR-0017). Quote
// ATTRIBUTES words to a source; it refuses body copy, links and actions.
//
// The element follows the content, like Teaser's data-run: words alone are an
// <aside> named by the quote; words with a source or a portrait are a <figure> with
// a <blockquote> and a <figcaption>.

export const QUOTE_SIZES = ["sm", "md", "lg"] as const;

export interface QuoteInput {
  /** root id; needed for the aside's aria-labelledby */
  id?: string;
  size?: string;
  source?: string | null;
  hasMedia: boolean;
  hasQuote: boolean;
  capInline?: boolean;
}

export interface QuoteResolution {
  mode: "render" | "suppress" | "error";
  errorMessage: string;
  tag: "aside" | "figure";
  className: string;
  /** in write order — renderers keep it, so every renderer emits the same markup */
  attrs: Record<string, string>;
  /** id of the quote text; the aside is labelled by it */
  quoteId: string | null;
  hasSource: boolean;
}

export function resolveQuote(input: QuoteInput): QuoteResolution {
  const size = (input.size ?? "md").toLowerCase();
  const hasSource = !!input.source?.trim();
  const tag: QuoteResolution["tag"] = !input.hasMedia && !hasSource ? "aside" : "figure";
  const quoteId = input.id?.trim() ? `${input.id.trim()}-quote` : null;

  let mode: QuoteResolution["mode"] = "render";
  let errorMessage = "";

  if (!input.hasQuote) {
    mode = "suppress";
  } else if (!(QUOTE_SIZES as readonly string[]).includes(size)) {
    mode = "error";
    errorMessage = `invalid size "${input.size}" — expected ${QUOTE_SIZES.join(" | ")}`;
  }

  const attrs: Record<string, string> = {};
  // the root hook the conformance suites target, as on the Field components
  if (input.id?.trim()) attrs["data-id"] = input.id.trim();
  Object.assign(attrs, {
    "data-media": input.hasMedia ? "true" : "false",
    "data-source": hasSource ? "true" : "false",
    "data-size": size,
    "data-cap-inline": (input.capInline ?? true) ? "true" : "false",
  });
  if (tag === "aside" && quoteId) attrs["aria-labelledby"] = quoteId;

  return { mode, errorMessage, tag, className: "Quote", attrs, quoteId, hasSource };
}
