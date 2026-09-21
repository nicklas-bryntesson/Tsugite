// CtaButton — the holes in the table (ADR-0018): the effect layers a variant owns, as
// data the renderers read, and the part markup the string-building renderers share.
import { escapeHtml } from "./html";

/** Per variant, the effect layers written as spans BEFORE the label, in order. The
 *  gradient variant draws its reflection and its shadow with pseudo-elements and needs
 *  none; a future variant with layered DOM effects lists them here. */
export const CTA_LAYERS: Record<string, readonly string[]> = {
  gradient: [],
};

export function ctaLayersHtml(variant: string): string {
  return (CTA_LAYERS[variant] ?? []).map((l) => `<span class="CtaButton-${l}" aria-hidden="true"></span>`).join("");
}

export function ctaIconHtml(iconName: string): string {
  return `<svg class="CtaButton-icon" aria-hidden="true" focusable="false"><use href="#${escapeHtml(iconName)}"></use></svg>`;
}

export function ctaTextHtml(childHtml: string): string {
  return `<span class="CtaButton-text">${childHtml}</span>`;
}
