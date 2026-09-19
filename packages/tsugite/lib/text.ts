// Text — the holes in the table (ADR-0018): the run mode, and the plan a renderer follows
// for the engine container (ADR-0012 §1).
import type { Resolution, View } from "./recipe";
import { runOf } from "./typographyFamily.ts";
import { escapeHtml } from "./html";

/** Derived values. The run mode follows the element (ADR-0012 §3). */
export const textDerive = {
  run: ({ tag }: View) => runOf(tag),
};

/** The engine container and the run's HTML: child markup passes through the same
 *  container as prop text (ADR-0012 §1). */
export function textPlan(r: Resolution): { containerClass: string; innerHtml: string | null } {
  const words = r.parts.text as string | null;
  return { containerClass: "text-content", innerHtml: r.parts.children || !words ? null : escapeHtml(words) };
}
