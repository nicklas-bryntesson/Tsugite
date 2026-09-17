// Notice — the recipe. Framework-free: resolves props to the class, the data-*
// attributes and the icon path every renderer writes out verbatim (ADR-0017).
// Notice INFORMS: a presentational message with a severity; it owns no live role.

export const NOTICE_VARIANTS = ["error", "warning", "success", "info", "neutral"] as const;
export type NoticeVariant = (typeof NOTICE_VARIANTS)[number];

// TODO(decide): should these icons point to a site-wide icon registry instead?
/** Inline stroke paths, 24×24, drawn with currentColor. Severity is carried by the icon. */
export const NOTICE_ICONS: Record<NoticeVariant, string> = {
  error:
    '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
  warning:
    '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
  success:
    '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
  info:
    '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
  neutral:
    '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
};

export interface NoticeInput {
  variant?: string;
  icon?: boolean;
  border?: boolean;
  emphasis?: boolean;
  growInline?: boolean;
  capInline?: boolean;
  class?: string;
}

export interface NoticeResolution {
  mode: "render" | "error";
  errorMessage: string;
  className: string;
  /** in write order — renderers keep it, so every renderer emits the same markup */
  attrs: Record<string, string>;
  variant: NoticeVariant;
  /** whether the icon part renders, and its path */
  icon: boolean;
  iconPath: string;
}

export function resolveNotice(input: NoticeInput): NoticeResolution {
  const variantProp = (input.variant ?? "neutral").toLowerCase();
  const icon = input.icon ?? true;
  const border = input.border ?? false;
  const emphasis = input.emphasis ?? false;
  const growInline = input.growInline ?? true;
  const capInline = input.capInline ?? true;

  let mode: NoticeResolution["mode"] = "render";
  let errorMessage = "";
  if (!(NOTICE_VARIANTS as readonly string[]).includes(variantProp)) {
    mode = "error";
    errorMessage = `invalid variant "${input.variant}" — expected ${NOTICE_VARIANTS.join(" | ")}`;
  }
  const variant = (mode === "render" ? variantProp : "neutral") as NoticeVariant;

  return {
    mode,
    errorMessage,
    className: input.class && String(input.class).trim() ? `Notice ${input.class}` : "Notice",
    attrs: {
      "data-variant": variant,
      "data-icon": icon ? "true" : "false",
      "data-border": border ? "true" : "false",
      "data-emphasis": emphasis ? "true" : "false",
      "data-grow-inline": growInline ? "true" : "false",
      "data-cap-inline": capInline ? "true" : "false",
    },
    variant,
    icon,
    iconPath: NOTICE_ICONS[variant],
  };
}
