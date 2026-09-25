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

/** The label part as an HTML string: the visible text, then the hidden suffix that
 *  extends the accessible name ("Read more" + " about {heading}"). */
export function buttonTextHtml(childHtml: string, srText: string | null): string {
  const suffix = srText ? `<span class="ScreenReaderText">${escapeHtml(srText)}</span>` : "";
  return `<span class="Button-text">${childHtml}${suffix}</span>`;
}
