// TextBlock — the holes in the table (ADR-0018): the run mode, and the plan a renderer
// follows for the engine container. The string is escaped whole; the CSS honours its
// line breaks (white-space: pre-line).
import type { Resolution, View } from "./recipe";
import { runOf } from "./typographyFamily.ts";
import { escapeHtml } from "./html";

export const textBlockDerive = {
  run: ({ tag }: View) => runOf(tag),
};

export function textBlockPlan(r: Resolution): { containerClass: string; innerHtml: string | null } {
  const words = r.parts.text as string | null;
  return { containerClass: "textblock-content", innerHtml: words ? escapeHtml(words) : null };
}
