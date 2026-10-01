// Caption — the holes in the table (ADR-0018): the element and the text-box mode, both
// from the inline intent (ADR-0024), and the plan a renderer follows for the engine
// container (ADR-0012 §1).
import { booleanOf, type Resolution, type View } from "./recipe";
import { escapeHtml } from "./html";

/** Derived values. The engine's mode is the intent, whatever the element. */
export const captionDerive = {
  textBox: ({ axes }: View) => (axes.inline ? "inline" : "block"),
};

/** Default holes. The element is resolved before the axes, so the formula reads the
 *  intent from the props: an inline Caption is a span, any other a p. */
export const captionDefaults = (props: Record<string, unknown>) => ({
  element: () => (booleanOf(props.inline) ? "span" : "p"),
});

export function captionPlan(r: Resolution): { containerClass: string; innerHtml: string | null } {
  const words = r.parts.text as string | null;
  return { containerClass: "text", innerHtml: r.parts.children || !words ? null : escapeHtml(words) };
}
