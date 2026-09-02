// THE --ui-* SEAM (ADR-0002/0003/0004)
//
// The reference-components' one public design surface, now expressed as
// APPEARANCE-FREE POINTERS into the semantic layer. The semantic tokens do
// the four-mode switching; the seam never mentions appearance. This factory
// GENERATES src/styles/ui-tokens.css — humans edit here, never there.

export const uiSeamTokens = {
  // Surface — panels / popovers
  "--ui-surface": "var(--color-surface-page)",
  "--ui-surface-foreground": "var(--color-text-primary)",
  "--ui-surface-padding": "0.75rem",
  "--ui-radius": "0.75rem",

  // Elevation ink — four-mode token; light-dark() no longer ships (T7).
  "--ui-shadow": "var(--color-shadow-popup)",

  // Lines & focus
  "--ui-border": "var(--color-border-subtle)",
  "--ui-ring": "var(--color-focus-ring)",

  // Roles
  "--ui-primary": "var(--color-interactive-primary)",
  "--ui-primary-foreground": "var(--color-interactive-onPrimary)",
  "--ui-muted-foreground": "var(--color-text-secondary)",
  "--ui-hover": "var(--color-interactive-secondary-hoverSurface)",

  // State — shared by field-invalid and Notice
  "--ui-destructive": "var(--color-feedback-error)",
  "--ui-warning": "var(--color-feedback-warning)",
  "--ui-warning-foreground": "var(--color-feedback-onWarning)",
  "--ui-success": "var(--color-feedback-success)",
  "--ui-info": "var(--color-feedback-info)",

  // Typography — field text runs through the label role ramp (the
  // typography sweep, tasks/typography-map.md F1/F2). The strong stop
  // reuses the existing body-bold weight so within-component emphasis
  // (calendar today/selected) survives without new role vocabulary;
  // whether the label role should own a strong stop is an upstream
  // question, and the seam can re-aim without touching components.
  "--ui-font-size": "var(--fontSize-label)",
  "--ui-font-size-small": "var(--fontSize-label-small)",
  "--ui-font-weight": "var(--fontWeight-label)",
  "--ui-font-weight-strong": "var(--fontWeight-body-bold)",

  // Site-scaffolding alias: reference components read --SITE--PADDING for
  // popup viewport padding; our name for that value is the --site-offset ramp.
  "--SITE--PADDING": "var(--site-offset)",
};
