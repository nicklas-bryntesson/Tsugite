// CoverComposition — the table (ADR-0018), first for its claim. Media with a heading, prose and
// buttons over it. CoverComposition.astro still renders by hand; the table holds what is
// data so far: the claim, which engine/claims.js turns into CSS.
import type { Recipe } from "../lib/recipe";

export const covercomposition = {
  name: "CoverComposition",
  promise: "Media with a heading, prose and buttons that read on whatever ground they stand.",
  refuses: ["a voice in the narrow layout — there the content stands on the page"],
  class: "CoverComposition",
  element: { values: ["div"], default: "div" },
  axes: {},
  content: { empty: "render" },
  /** Above 21.25rem the content lies on the media and scrim the composition creates, so it
   *  claims the inverse voice there. Below, it stands on the page and claims nothing: the
   *  baseline. (docs/seams.md: the exception is where the composition creates a ground.) */
  claims: [{ part: "content-container", range: { min: "21.25rem" }, voice: "inverse", volume: "primary" }],
} as const satisfies Recipe;
