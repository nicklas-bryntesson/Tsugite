// Notice — the holes in the table (ADR-0018): the two derived flags, and the icon per
// severity, which is markup data the string-building and the tree-building renderers share.
import type { View } from "./recipe";

/** The derived flags of the Notice recipe, by name: whether the host placed anything in the regions. */
export const noticeDerive = {
  hasActions: ({ parts }: View) => !!parts.actions,
  hasDismiss: ({ parts }: View) => !!parts.dismiss,
};

// TODO(decide): should these icons point to a site-wide icon registry instead?
/** Inline stroke paths, 24×24, drawn with currentColor. Severity is carried by the icon. */
export const NOTICE_ICONS: Record<string, string> = {
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
