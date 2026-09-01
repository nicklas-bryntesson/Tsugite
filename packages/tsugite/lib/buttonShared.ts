// Port of AiPoc TagHelpers/ButtonHelper.cs — shared logic for
// LinkButton.astro and ActionButton.astro.

export const VALID_EMPHASIS = ["primary", "secondary", "tertiary"];
export const VALID_INTENTS = ["neutral", "destructive", "success"];
export const VALID_SIZES = ["sm", "md", "lg"];
export const VALID_ICON_POSITIONS = ["left", "right"];

export const escapeHtml = (s: string): string =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export interface SharedButtonOptions {
  emphasis: string;
  intent?: string | null;
  pill: boolean;
  size: string;
  icon?: string | null;
  iconPosition: string;
  ariaLabel?: string | null;
}

export function sharedButtonAttributes(opts: SharedButtonOptions): Record<string, string> {
  const attrs: Record<string, string> = {};

  if (VALID_EMPHASIS.includes(opts.emphasis.toLowerCase()))
    attrs["data-emphasis"] = opts.emphasis.toLowerCase();

  if (opts.intent && VALID_INTENTS.includes(opts.intent.toLowerCase()))
    attrs["data-intent"] = opts.intent.toLowerCase();

  if (VALID_SIZES.includes(opts.size.toLowerCase()))
    attrs["data-size"] = opts.size.toLowerCase();

  attrs["data-pill"] = opts.pill ? "true" : "false";

  if (opts.icon) {
    attrs["data-icon"] = opts.icon;
    if (VALID_ICON_POSITIONS.includes(opts.iconPosition.toLowerCase()))
      attrs["data-icon-position"] = opts.iconPosition.toLowerCase();
  }

  if (opts.ariaLabel) attrs["aria-label"] = opts.ariaLabel;

  return attrs;
}

export function renderIcon(iconName: string): string {
  const encoded = escapeHtml(iconName);
  return `<svg class="Button-icon" aria-hidden="true" focusable="false"><use href="#${encoded}" /></svg>`;
}
