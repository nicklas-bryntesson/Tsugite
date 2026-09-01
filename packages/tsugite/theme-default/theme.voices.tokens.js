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
      surface: t(v("--COLOR-N10"), v("--COLOR-N80"), v("--COLOR-N00"), v("--COLOR-N95")),
      text: t(v("--COLOR-N90"), v("--COLOR-N05"), v("--COLOR-N95"), v("--COLOR-N00")),
      textMuted: t(v("--COLOR-N60"), v("--COLOR-N35"), v("--COLOR-N95"), v("--COLOR-N00")),
      border: t(v("--COLOR-N30"), v("--COLOR-N60"), v("--COLOR-N95"), v("--COLOR-N00")),
      // Buttons keep the semantic look — cells restate the same RAW pointers
      // so the schema stays total (every voice answers every channel).
      buttonColorPrimary: t(v("--COLOR-N00"), v("--COLOR-N95"), v("--COLOR-N00"), v("--COLOR-N95")),
      buttonBackgroundColorPrimary: t(v("--COLOR-B80"), v("--COLOR-B30"), v("--COLOR-N95"), v("--COLOR-N00")),
      buttonBorderColorPrimary: t(v("--COLOR-B80"), v("--COLOR-B30"), v("--COLOR-N95"), v("--COLOR-N00")),
      buttonBackgroundColorPrimaryHover: t(v("--COLOR-B90"), v("--COLOR-B20"), v("--COLOR-N95"), v("--COLOR-N00")),
      buttonColorSecondary: t(v("--COLOR-B80"), v("--COLOR-B20"), v("--COLOR-N95"), v("--COLOR-N00")),
      buttonBorderColorSecondary: t(v("--COLOR-B30"), v("--COLOR-B60"), v("--COLOR-N95"), v("--COLOR-N00")),
      buttonBorderColorSecondaryHover: t(v("--COLOR-B80"), v("--COLOR-B20"), v("--COLOR-N95"), v("--COLOR-N00")),
      buttonBackgroundColorSecondaryHover: t(v("--COLOR-N20"), v("--COLOR-N75"), "transparent", "transparent"),
    },
    subtle: {
      surface: t(v("--COLOR-N05"), v("--COLOR-N85"), v("--COLOR-N00"), v("--COLOR-N95")),
      text: t(v("--COLOR-N90"), v("--COLOR-N05"), v("--COLOR-N95"), v("--COLOR-N00")),
      textMuted: t(v("--COLOR-N60"), v("--COLOR-N35"), v("--COLOR-N95"), v("--COLOR-N00")),
      border: t(v("--COLOR-N20"), v("--COLOR-N70"), v("--COLOR-N95"), v("--COLOR-N00")),
      buttonColorPrimary: t(v("--COLOR-N00"), v("--COLOR-N95"), v("--COLOR-N00"), v("--COLOR-N95")),
      buttonBackgroundColorPrimary: t(v("--COLOR-B80"), v("--COLOR-B30"), v("--COLOR-N95"), v("--COLOR-N00")),
      buttonBorderColorPrimary: t(v("--COLOR-B80"), v("--COLOR-B30"), v("--COLOR-N95"), v("--COLOR-N00")),
      buttonBackgroundColorPrimaryHover: t(v("--COLOR-B90"), v("--COLOR-B20"), v("--COLOR-N95"), v("--COLOR-N00")),
      buttonColorSecondary: t(v("--COLOR-B80"), v("--COLOR-B20"), v("--COLOR-N95"), v("--COLOR-N00")),
      buttonBorderColorSecondary: t(v("--COLOR-B30"), v("--COLOR-B60"), v("--COLOR-N95"), v("--COLOR-N00")),
      buttonBorderColorSecondaryHover: t(v("--COLOR-B80"), v("--COLOR-B20"), v("--COLOR-N95"), v("--COLOR-N00")),
      buttonBackgroundColorSecondaryHover: t(v("--COLOR-N15"), v("--COLOR-N80"), "transparent", "transparent"),
    },
  },

  // ── brand — the blue voice, authored ADAPTIVE (dark rows re-render) ───────
  brand: {
    primary: {
      surface: t(v("--COLOR-B80"), v("--COLOR-B70"), v("--COLOR-B90"), v("--COLOR-B95")),
      text: t(v("--COLOR-N00"), v("--COLOR-N00"), v("--COLOR-N00"), v("--COLOR-N00")),
      textMuted: t(v("--COLOR-B10"), v("--COLOR-B10"), v("--COLOR-N00"), v("--COLOR-N00")),
      border: t(v("--COLOR-B60"), v("--COLOR-B30"), v("--COLOR-N00"), v("--COLOR-N00")),
      // Full voice = deep ground → buttons invert (light chip).
      buttonColorPrimary: t(v("--COLOR-B90"), v("--COLOR-B90"), v("--COLOR-N95"), v("--COLOR-N95")),
      buttonBackgroundColorPrimary: t(v("--COLOR-N00"), v("--COLOR-N00"), v("--COLOR-N00"), v("--COLOR-N00")),
      buttonBorderColorPrimary: t(v("--COLOR-N00"), v("--COLOR-N00"), v("--COLOR-N00"), v("--COLOR-N00")),
      buttonBackgroundColorPrimaryHover: t(v("--COLOR-B05"), v("--COLOR-B05"), v("--COLOR-N00"), v("--COLOR-N00")),
      buttonColorSecondary: t(v("--COLOR-N00"), v("--COLOR-N00"), v("--COLOR-N00"), v("--COLOR-N00")),
      buttonBorderColorSecondary: t(v("--COLOR-B20"), v("--COLOR-B20"), v("--COLOR-N00"), v("--COLOR-N00")),
      buttonBorderColorSecondaryHover: t(v("--COLOR-N00"), v("--COLOR-N00"), v("--COLOR-N00"), v("--COLOR-N00")),
      buttonBackgroundColorSecondaryHover: t("transparent", "transparent", "transparent", "transparent"),
    },
    subtle: {
      surface: t(v("--COLOR-B05"), v("--COLOR-B90"), v("--COLOR-N00"), v("--COLOR-N95")),
      text: t(v("--COLOR-N90"), v("--COLOR-N05"), v("--COLOR-N95"), v("--COLOR-N00")),
      textMuted: t(v("--COLOR-N60"), v("--COLOR-B20"), v("--COLOR-N95"), v("--COLOR-N00")),
      border: t(v("--COLOR-B20"), v("--COLOR-B70"), v("--COLOR-N95"), v("--COLOR-N00")),
      buttonColorPrimary: t(v("--COLOR-N00"), v("--COLOR-N95"), v("--COLOR-N00"), v("--COLOR-N95")),
      buttonBackgroundColorPrimary: t(v("--COLOR-B80"), v("--COLOR-B30"), v("--COLOR-N95"), v("--COLOR-N00")),
      buttonBorderColorPrimary: t(v("--COLOR-B80"), v("--COLOR-B30"), v("--COLOR-N95"), v("--COLOR-N00")),
      buttonBackgroundColorPrimaryHover: t(v("--COLOR-B90"), v("--COLOR-B20"), v("--COLOR-N95"), v("--COLOR-N00")),
      buttonColorSecondary: t(v("--COLOR-B80"), v("--COLOR-B20"), v("--COLOR-N95"), v("--COLOR-N00")),
      buttonBorderColorSecondary: t(v("--COLOR-B30"), v("--COLOR-B60"), v("--COLOR-N95"), v("--COLOR-N00")),
      buttonBorderColorSecondaryHover: t(v("--COLOR-B80"), v("--COLOR-B20"), v("--COLOR-N95"), v("--COLOR-N00")),
      buttonBackgroundColorSecondaryHover: t(v("--COLOR-B10"), v("--COLOR-B80"), "transparent", "transparent"),
    },
  },

  // ── accent — the pink voice, authored MODE-STABLE (deep magenta stays) ────
  accent: {
    primary: {
      surface: t(v("--COLOR-PI70"), v("--COLOR-PI70"), v("--COLOR-PI85"), v("--COLOR-PI85")),
      text: t(v("--COLOR-N00"), v("--COLOR-N00"), v("--COLOR-N00"), v("--COLOR-N00")),
      textMuted: t(v("--COLOR-PI25"), v("--COLOR-PI25"), v("--COLOR-N00"), v("--COLOR-N00")),
      border: t(v("--COLOR-PI50"), v("--COLOR-PI50"), v("--COLOR-N00"), v("--COLOR-N00")),
      buttonColorPrimary: t(v("--COLOR-PI85"), v("--COLOR-PI85"), v("--COLOR-N95"), v("--COLOR-N95")),
      buttonBackgroundColorPrimary: t(v("--COLOR-N00"), v("--COLOR-N00"), v("--COLOR-N00"), v("--COLOR-N00")),
      buttonBorderColorPrimary: t(v("--COLOR-N00"), v("--COLOR-N00"), v("--COLOR-N00"), v("--COLOR-N00")),
      buttonBackgroundColorPrimaryHover: t(v("--COLOR-PI10"), v("--COLOR-PI10"), v("--COLOR-N00"), v("--COLOR-N00")),
      buttonColorSecondary: t(v("--COLOR-N00"), v("--COLOR-N00"), v("--COLOR-N00"), v("--COLOR-N00")),
      buttonBorderColorSecondary: t(v("--COLOR-PI25"), v("--COLOR-PI25"), v("--COLOR-N00"), v("--COLOR-N00")),
      buttonBorderColorSecondaryHover: t(v("--COLOR-N00"), v("--COLOR-N00"), v("--COLOR-N00"), v("--COLOR-N00")),
      buttonBackgroundColorSecondaryHover: t("transparent", "transparent", "transparent", "transparent"),
    },
    subtle: {
      surface: t(v("--COLOR-PI10"), v("--COLOR-PI85"), v("--COLOR-N00"), v("--COLOR-N95")),
      text: t(v("--COLOR-N90"), v("--COLOR-PI10"), v("--COLOR-N95"), v("--COLOR-N00")),
      textMuted: t(v("--COLOR-N60"), v("--COLOR-PI25"), v("--COLOR-N95"), v("--COLOR-N00")),
      border: t(v("--COLOR-PI25"), v("--COLOR-PI70"), v("--COLOR-N95"), v("--COLOR-N00")),
      buttonColorPrimary: t(v("--COLOR-N00"), v("--COLOR-PI85"), v("--COLOR-N00"), v("--COLOR-N95")),
      buttonBackgroundColorPrimary: t(v("--COLOR-PI70"), v("--COLOR-PI25"), v("--COLOR-N95"), v("--COLOR-N00")),
      buttonBorderColorPrimary: t(v("--COLOR-PI70"), v("--COLOR-PI25"), v("--COLOR-N95"), v("--COLOR-N00")),
      buttonBackgroundColorPrimaryHover: t(v("--COLOR-PI85"), v("--COLOR-PI10"), v("--COLOR-N95"), v("--COLOR-N00")),
      buttonColorSecondary: t(v("--COLOR-PI70"), v("--COLOR-PI25"), v("--COLOR-N95"), v("--COLOR-N00")),
      buttonBorderColorSecondary: t(v("--COLOR-PI50"), v("--COLOR-PI50"), v("--COLOR-N95"), v("--COLOR-N00")),
      buttonBorderColorSecondaryHover: t(v("--COLOR-PI70"), v("--COLOR-PI25"), v("--COLOR-N95"), v("--COLOR-N00")),
      buttonBackgroundColorSecondaryHover: t(v("--COLOR-PI25"), v("--COLOR-PI70"), "transparent", "transparent"),
    },
  },

  // ── inverse — the dark-ground voice (Cover's preserved table) ─────────────
  inverse: {
    primary: {
      // Surface rows are new (Cover never paints one — the scrim is its
      // ground); a standalone inverse section gets a stable dark panel.
      surface: t(v("--COLOR-N90"), v("--COLOR-N95"), v("--COLOR-N95"), v("--COLOR-N95")),
      // Text over media — always light; the scrim/ground carries contrast.
      text: t(v("--COLOR-N00"), v("--COLOR-N00"), v("--COLOR-N00"), v("--COLOR-N00")),
      textMuted: t(v("--COLOR-N25"), v("--COLOR-N25"), v("--COLOR-N00"), v("--COLOR-N00")),
      border: t(v("--COLOR-N70"), v("--COLOR-N70"), v("--COLOR-N00"), v("--COLOR-N00")),
      // Preserved rows from the retired theme.inverse.tokens.js (T5):
      buttonColorPrimary: t(v("--COLOR-N80"), v("--COLOR-N90"), v("--COLOR-N95"), v("--COLOR-N95")),
      buttonBackgroundColorPrimary: t(v("--COLOR-N00"), v("--COLOR-N00"), v("--COLOR-N00"), v("--COLOR-N00")),
      buttonBorderColorPrimary: t(v("--COLOR-N00"), v("--COLOR-N00"), v("--COLOR-N00"), v("--COLOR-N00")),
      buttonBackgroundColorPrimaryHover: t(v("--COLOR-B05"), v("--COLOR-B05"), v("--COLOR-N00"), v("--COLOR-N00")),
      buttonColorSecondary: t(v("--COLOR-N00"), v("--COLOR-N00"), v("--COLOR-N00"), v("--COLOR-N00")),
      buttonBorderColorSecondary: t(v("--COLOR-B20"), v("--COLOR-B20"), v("--COLOR-N00"), v("--COLOR-N00")),
      buttonBorderColorSecondaryHover: t(v("--COLOR-N00"), v("--COLOR-N00"), v("--COLOR-N00"), v("--COLOR-N00")),
      buttonBackgroundColorSecondaryHover: t("transparent", "transparent", "transparent", "transparent"),
    },
  },
};
