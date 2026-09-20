// NavItem — the holes in the table (ADR-0018): the two ARIA attributes that are present or
// not, and the part markup the string-building renderers share.
import type { View } from "./recipe";
import { escapeHtml } from "./html";

export const navItemDerive = {
  ariaCurrent: ({ tag, axes }: View) => (tag === "a" && axes.current === true ? "page" : null),
  ariaExpanded: ({ tag, axes }: View) => (tag === "button" ? (axes.expanded ? "true" : "false") : null),
};

/** The icon part as an HTML string, for string-building renderers. */
export function navItemIconHtml(iconName: string): string {
  return `<svg class="NavItem-icon" aria-hidden="true" focusable="false"><use href="#${escapeHtml(iconName)}"></use></svg>`;
}

/** The label part as an HTML string. */
export function navItemTextHtml(childHtml: string): string {
  return `<span class="NavItem-text">${childHtml}</span>`;
}
