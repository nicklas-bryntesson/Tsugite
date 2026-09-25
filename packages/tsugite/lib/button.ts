// Button — the hole in the table (ADR-0018): the one formula recipes/button.recipe.ts
// declares but cannot express, and the icon markup the string-building renderers share.
import type { View } from "./recipe";
import { escapeHtml } from "./html";

/** The derived flags of the Button recipe, by name. Icon-only: an icon and no label. */
export const buttonDerive = {
  iconOnly: ({ parts }: View) => !!parts.icon && !parts.text,
};

/** The icon part as an HTML string, for string-building renderers. */
export function buttonIconHtml(iconName: string): string {
  return `<svg class="Button-icon" aria-hidden="true" focusable="false"><use href="#${escapeHtml(iconName)}"></use></svg>`;
}

/** A screen-reader affix as an HTML string, or nothing. The span is out of flow, so it
 *  takes no grid cell: it sits beside the label (or alone, on an icon-only button) and
 *  only the accessible name notices it — DOM order is name order. */
export function buttonAffixHtml(words: string | null): string {
  return words ? `<span class="ScreenReaderText">${escapeHtml(words)}</span>` : "";
}

/** The label part as an HTML string: the visible text. */
export function buttonTextHtml(childHtml: string): string {
  return `<span class="Button-text">${childHtml}</span>`;
}
