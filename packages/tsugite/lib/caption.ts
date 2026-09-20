// Caption — the holes in the table (ADR-0018): the run mode, and the plan a renderer
// follows for the engine container (ADR-0012 §1).
import type { Resolution, View } from "./recipe";
import { runOf } from "./typographyFamily.ts";
import { escapeHtml } from "./html";

export const captionDerive = {
  run: ({ tag }: View) => runOf(tag),
};

export function captionPlan(r: Resolution): { containerClass: string; innerHtml: string | null } {
  const words = r.parts.text as string | null;
  return { containerClass: "caption-content", innerHtml: r.parts.children || !words ? null : escapeHtml(words) };
}
