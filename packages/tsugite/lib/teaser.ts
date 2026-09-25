// Teaser — the hole in the table (ADR-0018): the derived flag recipes/teaser.recipe.ts
// declares, and the content plan a renderer follows once the table has resolved.
import type { Resolution, View } from "./recipe";

/** The derived flags of the Teaser recipe, by name. */
export const teaserDerive = {
  hasMedia: ({ parts }: View) => !!parts.media,
};

/** What the renderer needs to know beyond the attributes: which part carries the link,
 *  whether there is a body, and the words the button announces. */
export function teaserPlan(r: Resolution) {
  const href = (r.parts.href as string | null) ?? null;
  const heading = (r.parts.heading as string | null) ?? null;
  const button = r.attrs["data-button"] === "true";
  return {
    href,
    heading,
    /** the heading is the stretched link: a destination and no button */
    headingIsLink: !!href && !button,
    hasBody: !!r.parts.excerpt || !!r.parts.body || button,
    buttonLabel: r.parts.buttonLabel as string,
    /** the hidden suffix that completes the button's accessible name, or null without a heading */
    buttonScreenReaderSuffix: heading ? `${r.parts.buttonContext as string}${heading}` : null,
  };
}
