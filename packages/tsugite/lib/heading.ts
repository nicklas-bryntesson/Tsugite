// Heading — the holes in the table (ADR-0018): the default size, the run mode, the
// highlight, and the plan a renderer follows for the engine container (ADR-0012 §1).
import type { Resolution, View } from "./recipe";
import { runOf } from "./typographyFamily.ts";
import { escapeHtml } from "./html";

const ELEMENT_SIZE: Record<string, string> = { h1: "1", h2: "2", h3: "3", h4: "4", h5: "5", h6: "6" };

/** Axis defaults the table declares as holes. Size: display 2, heading follows the element. */
export const headingDefaults = {
  size: ({ tag, axes }: View) => (axes.variant === "display" ? "2" : (ELEMENT_SIZE[tag] ?? "2")),
};

/** Derived values. The run mode follows the element (ADR-0012 §3). */
export const headingDerive = {
  run: ({ tag }: View) => runOf(tag),
};

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

/** The engine container and the run's HTML. Child markup passes through the same
 *  container as prop text (ADR-0012 §1); a link needs text, never children. */
export function headingPlan(r: Resolution): {
  container: { tag: "a" | "span"; className: string; href?: string };
  /** the run's HTML from the text prop (escaped, highlighted); null when children carry it */
  innerHtml: string | null;
} {
  const text = r.parts.text as string | null;
  const href = r.parts.href as string | null;
  const highlight = r.parts.highlight as string | null;
  const container = href && text ? ({ tag: "a", className: "heading-link", href } as const) : ({ tag: "span", className: "heading-text" } as const);
  const innerHtml = r.parts.children || !text ? null : highlight ? applyHighlight(text, highlight) : escapeHtml(text);
  return { container, innerHtml };
}
