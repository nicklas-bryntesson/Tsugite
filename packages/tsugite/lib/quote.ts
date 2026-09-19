// Quote — the holes in the table (ADR-0018): the element that follows the content, the
// four derived values, and the id of the quote text.
import type { Resolution, View } from "./recipe";

/** The element follows the content: words alone are an aside, words with a source or a portrait a figure. */
export const quoteDefaults = {
  element: ({ parts }: View) => (parts.media || parts.source ? "figure" : "aside"),
};

const quoteIdOf = (parts: View["parts"]) => (typeof parts.id === "string" ? `${parts.id.trim()}-quote` : null);

export const quoteDerive = {
  hasMedia: ({ parts }: View) => !!parts.media,
  hasSource: ({ parts }: View) => !!parts.source,
  dataId: ({ parts }: View) => (typeof parts.id === "string" ? parts.id.trim() : null),
  labelledBy: ({ tag, parts }: View) => (tag === "aside" ? quoteIdOf(parts) : null),
};

/** What the renderer needs beyond the attributes. */
export function quotePlan(r: Resolution) {
  return {
    /** id of the quote text; the aside is labelled by it */
    quoteId: r.tag === "aside" ? quoteIdOf(r.parts) : null,
    words: (r.parts.quote as string | null) ?? null,
    source: (r.parts.source as string | null) ?? null,
  };
}
