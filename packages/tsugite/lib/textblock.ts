// TextBlock — the holes in the table (ADR-0018): the text-box mode, always block (a field
// is never in a line, ADR-0024 §5), and the plan a renderer follows for the engine
// container. The string is escaped whole; the CSS honours its line breaks
// (white-space: pre-line).
import type { Resolution } from "./recipe";
import { escapeHtml } from "./html";

export const textBlockDerive = {
  textBox: () => "block",
};

export function textBlockPlan(r: Resolution): { containerClass: string; innerHtml: string | null } {
  const words = r.parts.text as string | null;
  return { containerClass: "text", innerHtml: words ? escapeHtml(words) : null };
}
