// ScreenReaderText — the one hole the table cannot hold (ADR-0018): the refusal of
// interactive content, which is a property of the child markup, not of a prop.
import { escapeHtml } from "./html";

const INTERACTIVE = /<(a|button|input|select|textarea|summary|details|iframe|audio|video)\b|\stabindex=|\scontenteditable\b/i;

/** The refusal message when the child markup holds something focusable, else null.
 *  A hidden control is a trap: it can take focus and cannot be seen. */
export function hiddenInteractive(childHtml: string): string | null {
  return INTERACTIVE.test(childHtml) ? "interactive content inside ScreenReaderText — a link, button or field that cannot be seen is a focus trap" : null;
}

/** The words as HTML: prop text escaped, child markup as given. */
export function screenReaderTextHtml(text: string | null, childHtml: string, hasChildren: boolean): string {
  return hasChildren ? childHtml : escapeHtml(text ?? "");
}
