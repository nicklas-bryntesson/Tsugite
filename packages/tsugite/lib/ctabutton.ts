// CtaButton — the holes in the table (ADR-0018): the effect layers a variant owns, as
// data the renderers read, and the part markup the string-building renderers share.
import { escapeHtml } from "./html";

/** The derived values of the CtaButton recipe: the voice and the text-box mode are
 *  constants, as on Button (ADR-0024 §5). */
export const ctaDerive = {
  voice: () => "button",
  textBox: () => "block",
};

/** The layers every CtaButton writes, whatever its variant: `hit`, the reach the hover
 *  lift would otherwise take from under the pointer. */
export const CTA_SHARED_LAYERS: readonly string[] = ["hit"];

/** Per variant, the effect layers written as spans BEFORE the label, in order. The
 *  gradient variant draws its reflection and its shadow with pseudo-elements and needs
 *  none; a future variant with layered DOM effects lists them here. */
export const CTA_LAYERS: Record<string, readonly string[]> = {
  gradient: [],
};

/** The layers of one button, shared first: part names, bare and lowercase. */
export function ctaLayers(variant: string): readonly string[] {
  return [...CTA_SHARED_LAYERS, ...(CTA_LAYERS[variant] ?? [])];
}

export function ctaLayersHtml(variant: string): string {
  return ctaLayers(variant).map((l) => `<span class="${l}" aria-hidden="true"></span>`).join("");
}

export function ctaIconHtml(iconName: string): string {
  return `<svg class="CtaButton-icon" aria-hidden="true" focusable="false"><use href="#${escapeHtml(iconName)}"></use></svg>`;
}

/** The label part as an HTML string: the visible text, the text-box engine's container. */
export function ctaTextHtml(childHtml: string): string {
  return `<span class="text">${childHtml}</span>`;
}
