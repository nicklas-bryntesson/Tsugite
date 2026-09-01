// THEME VOICES — the schema'd theme factory (ADR-0006).
//
// A voice is a DATA ENTRY: volumes × channels × four modes. The generator
// multiplies this into [data-theme="<voice>"] cell blocks (within the 8
// appearance contexts) plus voice-agnostic [data-prominence] wiring blocks.
// Nothing here is mechanism — flip vs mode-stable, palette, everything is
// table rows. Turn the knobs freely; the validators hold the shape.
//
// Voice names are ROLES (invariant-tested: the dark-contrast row can be
// authored without the name lying). Brand identities never appear here as
// names — they arrive as VALUES when a brand turns these knobs.
//
// First authoring (invented from the RAW palette, deliberately adjustable):
//   neutral — hue-less lift off the ground
//   brand   — the site's blue voice; authored ADAPTIVE (dark rows re-render)
//   accent  — the pink voice; authored MODE-STABLE (deep magenta stays)
//     → brand and accent together prove ADR-0006 §4: behaviour is table data.
//   inverse — the dark-ground voice (Cover's shipped table, preserved rows).
//     Deliberately mode-stable: media+scrim guarantee a dark ground in every
//     mode. Whether sections also need a true polarity-flipping voice is the
//     ADR-0006 deferred question — unchanged by this file.

export const VOLUMES = ["primary", "subtle"];

// Channels: the names consumers actually read. Section channels are consumed
// with a fallback (`var(--theme-surface, <semantic>)`); button channels are
// the ADR-0005 claim names Button already reads. The channel map is the SLOT
// SCHEMA — the frozen interface (ADR-0006 §5). Extending it is the expensive
// direction: every voice must then fill the new slot.
export const themeChannels = {
  surface: "--theme-surface",
  text: "--theme-text",
  textMuted: "--theme-textMuted",
  border: "--theme-border",
  buttonColorPrimary: "--theme-button-color-primary",
  buttonBackgroundColorPrimary: "--theme-button-backgroundColor-primary",
  buttonBorderColorPrimary: "--theme-button-borderColor-primary",
  buttonBackgroundColorPrimaryHover: "--theme-button-backgroundColor-primary-hover",
  buttonColorSecondary: "--theme-button-color-secondary",
  buttonBorderColorSecondary: "--theme-button-borderColor-secondary",
  buttonBorderColorSecondaryHover: "--theme-button-borderColor-secondary-hover",
  buttonBackgroundColorSecondaryHover: "--theme-button-backgroundColor-secondary-hover",
};

/** Cell name for a volume × channel pair — generated vocabulary, never typed. */
export const cellName = (volume, channelKey) => `--theme-cell-${volume}-${channelKey}`;

// The combination law (ADR-0006 §6): allowed voice × volume pairs, whitelist.
// inverse × subtle is deliberately undefined — a half-lifted dark ground has
// no authored meaning yet, so it does not exist.
export const voiceMatrix = {
  neutral: ["primary", "subtle"],
  brand: ["primary", "subtle"],
  accent: ["primary", "subtle"],
  inverse: ["primary"],
};

// Reading order per table: light · dark · light-contrast · dark-contrast.
// Contrast rows follow the house rule: midtones collapse toward the ground,
// ink hardens to full-contrast neutrals.
const t = (light, dark, lc, dc) => ({ light, dark, "light-contrast": lc, "dark-contrast": dc });
const v = (name) => `var(${name})`;

export const themeVoices = {
  // ── neutral — hue-less lift ────────────────────────────────────────────────
  neutral: {
    primary: {
      surface: t(v("--COLOR-SUMI-10"), v("--COLOR-SUMI-80"), v("--COLOR-SUMI-00"), v("--COLOR-SUMI-95")),
      text: t(v("--COLOR-SUMI-90"), v("--COLOR-SUMI-05"), v("--COLOR-SUMI-95"), v("--COLOR-SUMI-00")),
      textMuted: t(v("--COLOR-SUMI-60"), v("--COLOR-SUMI-35"), v("--COLOR-SUMI-95"), v("--COLOR-SUMI-00")),
      border: t(v("--COLOR-SUMI-30"), v("--COLOR-SUMI-60"), v("--COLOR-SUMI-95"), v("--COLOR-SUMI-00")),
      // Buttons keep the semantic look — cells restate the same RAW pointers
      // so the schema stays total (every voice answers every channel).
      buttonColorPrimary: t(v("--COLOR-SUMI-00"), v("--COLOR-SUMI-95"), v("--COLOR-SUMI-00"), v("--COLOR-SUMI-95")),
      buttonBackgroundColorPrimary: t(v("--COLOR-AI-80"), v("--COLOR-AI-30"), v("--COLOR-SUMI-95"), v("--COLOR-SUMI-00")),
      buttonBorderColorPrimary: t(v("--COLOR-AI-80"), v("--COLOR-AI-30"), v("--COLOR-SUMI-95"), v("--COLOR-SUMI-00")),
      buttonBackgroundColorPrimaryHover: t(v("--COLOR-AI-90"), v("--COLOR-AI-20"), v("--COLOR-SUMI-95"), v("--COLOR-SUMI-00")),
      buttonColorSecondary: t(v("--COLOR-AI-80"), v("--COLOR-AI-20"), v("--COLOR-SUMI-95"), v("--COLOR-SUMI-00")),
      buttonBorderColorSecondary: t(v("--COLOR-AI-30"), v("--COLOR-AI-60"), v("--COLOR-SUMI-95"), v("--COLOR-SUMI-00")),
      buttonBorderColorSecondaryHover: t(v("--COLOR-AI-80"), v("--COLOR-AI-20"), v("--COLOR-SUMI-95"), v("--COLOR-SUMI-00")),
      buttonBackgroundColorSecondaryHover: t(v("--COLOR-SUMI-20"), v("--COLOR-SUMI-75"), "transparent", "transparent"),
    },
    subtle: {
      surface: t(v("--COLOR-SUMI-05"), v("--COLOR-SUMI-85"), v("--COLOR-SUMI-00"), v("--COLOR-SUMI-95")),
      text: t(v("--COLOR-SUMI-90"), v("--COLOR-SUMI-05"), v("--COLOR-SUMI-95"), v("--COLOR-SUMI-00")),
      textMuted: t(v("--COLOR-SUMI-60"), v("--COLOR-SUMI-35"), v("--COLOR-SUMI-95"), v("--COLOR-SUMI-00")),
      border: t(v("--COLOR-SUMI-20"), v("--COLOR-SUMI-70"), v("--COLOR-SUMI-95"), v("--COLOR-SUMI-00")),
      buttonColorPrimary: t(v("--COLOR-SUMI-00"), v("--COLOR-SUMI-95"), v("--COLOR-SUMI-00"), v("--COLOR-SUMI-95")),
      buttonBackgroundColorPrimary: t(v("--COLOR-AI-80"), v("--COLOR-AI-30"), v("--COLOR-SUMI-95"), v("--COLOR-SUMI-00")),
      buttonBorderColorPrimary: t(v("--COLOR-AI-80"), v("--COLOR-AI-30"), v("--COLOR-SUMI-95"), v("--COLOR-SUMI-00")),
      buttonBackgroundColorPrimaryHover: t(v("--COLOR-AI-90"), v("--COLOR-AI-20"), v("--COLOR-SUMI-95"), v("--COLOR-SUMI-00")),
      buttonColorSecondary: t(v("--COLOR-AI-80"), v("--COLOR-AI-20"), v("--COLOR-SUMI-95"), v("--COLOR-SUMI-00")),
      buttonBorderColorSecondary: t(v("--COLOR-AI-30"), v("--COLOR-AI-60"), v("--COLOR-SUMI-95"), v("--COLOR-SUMI-00")),
      buttonBorderColorSecondaryHover: t(v("--COLOR-AI-80"), v("--COLOR-AI-20"), v("--COLOR-SUMI-95"), v("--COLOR-SUMI-00")),
      buttonBackgroundColorSecondaryHover: t(v("--COLOR-SUMI-15"), v("--COLOR-SUMI-80"), "transparent", "transparent"),
    },
  },

  // ── brand — the blue voice, authored ADAPTIVE (dark rows re-render) ───────
  brand: {
    primary: {
      surface: t(v("--COLOR-AI-80"), v("--COLOR-AI-70"), v("--COLOR-AI-90"), v("--COLOR-AI-95")),
      text: t(v("--COLOR-SUMI-00"), v("--COLOR-SUMI-00"), v("--COLOR-SUMI-00"), v("--COLOR-SUMI-00")),
      textMuted: t(v("--COLOR-AI-10"), v("--COLOR-AI-10"), v("--COLOR-SUMI-00"), v("--COLOR-SUMI-00")),
      border: t(v("--COLOR-AI-60"), v("--COLOR-AI-30"), v("--COLOR-SUMI-00"), v("--COLOR-SUMI-00")),
      // Full voice = deep ground → buttons invert (light chip).
      buttonColorPrimary: t(v("--COLOR-AI-90"), v("--COLOR-AI-90"), v("--COLOR-SUMI-95"), v("--COLOR-SUMI-95")),
      buttonBackgroundColorPrimary: t(v("--COLOR-SUMI-00"), v("--COLOR-SUMI-00"), v("--COLOR-SUMI-00"), v("--COLOR-SUMI-00")),
      buttonBorderColorPrimary: t(v("--COLOR-SUMI-00"), v("--COLOR-SUMI-00"), v("--COLOR-SUMI-00"), v("--COLOR-SUMI-00")),
      buttonBackgroundColorPrimaryHover: t(v("--COLOR-AI-05"), v("--COLOR-AI-05"), v("--COLOR-SUMI-00"), v("--COLOR-SUMI-00")),
      buttonColorSecondary: t(v("--COLOR-SUMI-00"), v("--COLOR-SUMI-00"), v("--COLOR-SUMI-00"), v("--COLOR-SUMI-00")),
      buttonBorderColorSecondary: t(v("--COLOR-AI-20"), v("--COLOR-AI-20"), v("--COLOR-SUMI-00"), v("--COLOR-SUMI-00")),
      buttonBorderColorSecondaryHover: t(v("--COLOR-SUMI-00"), v("--COLOR-SUMI-00"), v("--COLOR-SUMI-00"), v("--COLOR-SUMI-00")),
      buttonBackgroundColorSecondaryHover: t("transparent", "transparent", "transparent", "transparent"),
    },
    subtle: {
      surface: t(v("--COLOR-AI-05"), v("--COLOR-AI-90"), v("--COLOR-SUMI-00"), v("--COLOR-SUMI-95")),
      text: t(v("--COLOR-SUMI-90"), v("--COLOR-SUMI-05"), v("--COLOR-SUMI-95"), v("--COLOR-SUMI-00")),
      textMuted: t(v("--COLOR-SUMI-60"), v("--COLOR-AI-20"), v("--COLOR-SUMI-95"), v("--COLOR-SUMI-00")),
      border: t(v("--COLOR-AI-20"), v("--COLOR-AI-70"), v("--COLOR-SUMI-95"), v("--COLOR-SUMI-00")),
      buttonColorPrimary: t(v("--COLOR-SUMI-00"), v("--COLOR-SUMI-95"), v("--COLOR-SUMI-00"), v("--COLOR-SUMI-95")),
      buttonBackgroundColorPrimary: t(v("--COLOR-AI-80"), v("--COLOR-AI-30"), v("--COLOR-SUMI-95"), v("--COLOR-SUMI-00")),
      buttonBorderColorPrimary: t(v("--COLOR-AI-80"), v("--COLOR-AI-30"), v("--COLOR-SUMI-95"), v("--COLOR-SUMI-00")),
      buttonBackgroundColorPrimaryHover: t(v("--COLOR-AI-90"), v("--COLOR-AI-20"), v("--COLOR-SUMI-95"), v("--COLOR-SUMI-00")),
      buttonColorSecondary: t(v("--COLOR-AI-80"), v("--COLOR-AI-20"), v("--COLOR-SUMI-95"), v("--COLOR-SUMI-00")),
      buttonBorderColorSecondary: t(v("--COLOR-AI-30"), v("--COLOR-AI-60"), v("--COLOR-SUMI-95"), v("--COLOR-SUMI-00")),
      buttonBorderColorSecondaryHover: t(v("--COLOR-AI-80"), v("--COLOR-AI-20"), v("--COLOR-SUMI-95"), v("--COLOR-SUMI-00")),
      buttonBackgroundColorSecondaryHover: t(v("--COLOR-AI-10"), v("--COLOR-AI-80"), "transparent", "transparent"),
    },
  },

  // ── accent — the pink voice, authored MODE-STABLE (deep magenta stays) ────
  accent: {
    primary: {
      surface: t(v("--COLOR-HINOKI-80"), v("--COLOR-HINOKI-80"), v("--COLOR-HINOKI-95"), v("--COLOR-HINOKI-95")),
      text: t(v("--COLOR-SUMI-00"), v("--COLOR-SUMI-00"), v("--COLOR-SUMI-00"), v("--COLOR-SUMI-00")),
      textMuted: t(v("--COLOR-HINOKI-20"), v("--COLOR-HINOKI-20"), v("--COLOR-SUMI-00"), v("--COLOR-SUMI-00")),
      border: t(v("--COLOR-HINOKI-60"), v("--COLOR-HINOKI-60"), v("--COLOR-SUMI-00"), v("--COLOR-SUMI-00")),
      buttonColorPrimary: t(v("--COLOR-HINOKI-95"), v("--COLOR-HINOKI-95"), v("--COLOR-SUMI-95"), v("--COLOR-SUMI-95")),
      buttonBackgroundColorPrimary: t(v("--COLOR-SUMI-00"), v("--COLOR-SUMI-00"), v("--COLOR-SUMI-00"), v("--COLOR-SUMI-00")),
      buttonBorderColorPrimary: t(v("--COLOR-SUMI-00"), v("--COLOR-SUMI-00"), v("--COLOR-SUMI-00"), v("--COLOR-SUMI-00")),
      buttonBackgroundColorPrimaryHover: t(v("--COLOR-HINOKI-05"), v("--COLOR-HINOKI-05"), v("--COLOR-SUMI-00"), v("--COLOR-SUMI-00")),
      buttonColorSecondary: t(v("--COLOR-SUMI-00"), v("--COLOR-SUMI-00"), v("--COLOR-SUMI-00"), v("--COLOR-SUMI-00")),
      buttonBorderColorSecondary: t(v("--COLOR-HINOKI-20"), v("--COLOR-HINOKI-20"), v("--COLOR-SUMI-00"), v("--COLOR-SUMI-00")),
      buttonBorderColorSecondaryHover: t(v("--COLOR-SUMI-00"), v("--COLOR-SUMI-00"), v("--COLOR-SUMI-00"), v("--COLOR-SUMI-00")),
      buttonBackgroundColorSecondaryHover: t("transparent", "transparent", "transparent", "transparent"),
    },
    subtle: {
      surface: t(v("--COLOR-HINOKI-05"), v("--COLOR-HINOKI-95"), v("--COLOR-SUMI-00"), v("--COLOR-SUMI-95")),
      text: t(v("--COLOR-SUMI-90"), v("--COLOR-HINOKI-05"), v("--COLOR-SUMI-95"), v("--COLOR-SUMI-00")),
      textMuted: t(v("--COLOR-SUMI-60"), v("--COLOR-HINOKI-20"), v("--COLOR-SUMI-95"), v("--COLOR-SUMI-00")),
      border: t(v("--COLOR-HINOKI-20"), v("--COLOR-HINOKI-80"), v("--COLOR-SUMI-95"), v("--COLOR-SUMI-00")),
      buttonColorPrimary: t(v("--COLOR-SUMI-00"), v("--COLOR-HINOKI-95"), v("--COLOR-SUMI-00"), v("--COLOR-SUMI-95")),
      buttonBackgroundColorPrimary: t(v("--COLOR-HINOKI-80"), v("--COLOR-HINOKI-20"), v("--COLOR-SUMI-95"), v("--COLOR-SUMI-00")),
      buttonBorderColorPrimary: t(v("--COLOR-HINOKI-80"), v("--COLOR-HINOKI-20"), v("--COLOR-SUMI-95"), v("--COLOR-SUMI-00")),
      buttonBackgroundColorPrimaryHover: t(v("--COLOR-HINOKI-95"), v("--COLOR-HINOKI-05"), v("--COLOR-SUMI-95"), v("--COLOR-SUMI-00")),
      buttonColorSecondary: t(v("--COLOR-HINOKI-80"), v("--COLOR-HINOKI-20"), v("--COLOR-SUMI-95"), v("--COLOR-SUMI-00")),
      buttonBorderColorSecondary: t(v("--COLOR-HINOKI-60"), v("--COLOR-HINOKI-60"), v("--COLOR-SUMI-95"), v("--COLOR-SUMI-00")),
      buttonBorderColorSecondaryHover: t(v("--COLOR-HINOKI-80"), v("--COLOR-HINOKI-20"), v("--COLOR-SUMI-95"), v("--COLOR-SUMI-00")),
      buttonBackgroundColorSecondaryHover: t(v("--COLOR-HINOKI-20"), v("--COLOR-HINOKI-80"), "transparent", "transparent"),
    },
  },

  // ── inverse — the dark-ground voice (Cover's preserved table) ─────────────
  inverse: {
    primary: {
      // Surface rows are new (Cover never paints one — the scrim is its
      // ground); a standalone inverse section gets a stable dark panel.
      surface: t(v("--COLOR-SUMI-90"), v("--COLOR-SUMI-95"), v("--COLOR-SUMI-95"), v("--COLOR-SUMI-95")),
      // Text over media — always light; the scrim/ground carries contrast.
      text: t(v("--COLOR-SUMI-00"), v("--COLOR-SUMI-00"), v("--COLOR-SUMI-00"), v("--COLOR-SUMI-00")),
      textMuted: t(v("--COLOR-SUMI-25"), v("--COLOR-SUMI-25"), v("--COLOR-SUMI-00"), v("--COLOR-SUMI-00")),
      border: t(v("--COLOR-SUMI-70"), v("--COLOR-SUMI-70"), v("--COLOR-SUMI-00"), v("--COLOR-SUMI-00")),
      // Preserved rows from the retired theme.inverse.tokens.js (T5):
      buttonColorPrimary: t(v("--COLOR-SUMI-80"), v("--COLOR-SUMI-90"), v("--COLOR-SUMI-95"), v("--COLOR-SUMI-95")),
      buttonBackgroundColorPrimary: t(v("--COLOR-SUMI-00"), v("--COLOR-SUMI-00"), v("--COLOR-SUMI-00"), v("--COLOR-SUMI-00")),
      buttonBorderColorPrimary: t(v("--COLOR-SUMI-00"), v("--COLOR-SUMI-00"), v("--COLOR-SUMI-00"), v("--COLOR-SUMI-00")),
      buttonBackgroundColorPrimaryHover: t(v("--COLOR-AI-05"), v("--COLOR-AI-05"), v("--COLOR-SUMI-00"), v("--COLOR-SUMI-00")),
      buttonColorSecondary: t(v("--COLOR-SUMI-00"), v("--COLOR-SUMI-00"), v("--COLOR-SUMI-00"), v("--COLOR-SUMI-00")),
      buttonBorderColorSecondary: t(v("--COLOR-AI-20"), v("--COLOR-AI-20"), v("--COLOR-SUMI-00"), v("--COLOR-SUMI-00")),
      buttonBorderColorSecondaryHover: t(v("--COLOR-SUMI-00"), v("--COLOR-SUMI-00"), v("--COLOR-SUMI-00"), v("--COLOR-SUMI-00")),
      buttonBackgroundColorSecondaryHover: t("transparent", "transparent", "transparent", "transparent"),
    },
  },
};
