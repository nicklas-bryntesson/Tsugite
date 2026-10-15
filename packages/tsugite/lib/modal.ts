// Modal — the holes in the table (ADR-0018). `dismiss` is Tsugite's word; `closedby` is the
// platform's, written so the browser does the work where it can (ADR-0029 §7). A <dialog>
// is a dialog by its element, so only an alert writes a role. The region marker is always
// present and carries no value.
import type { View } from "./recipe";

const CLOSEDBY: Record<string, string> = { any: "any", request: "closerequest", none: "none" };

export const modalDerive = {
  closedby: ({ axes }: View) => CLOSEDBY[String(axes.dismiss)] ?? null,
  ariaRole: ({ axes }: View) => (axes.role === "alertdialog" ? "alertdialog" : null),
  region: () => "",
};

const TITLE = /\sdata-channel\s*=\s*["']?title\b/i;

/** The refusal message when nothing names the modal, else null. A name comes from a title
 *  channel in the content or from the label prop; the content is the rendered child markup,
 *  so a title a client-only component adds later is not seen here. */
export function unnamed(childHtml: string, label: unknown): string | null {
  if (typeof label === "string" && label.trim()) return null;
  return TITLE.test(childHtml)
    ? null
    : 'nothing names the modal — mark its heading data-channel="title", or pass label in the page language';
}
