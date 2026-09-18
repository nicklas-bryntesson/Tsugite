// Media presets — the brand's tables (ADR-0018 §7). Which crops exist and which widths a
// teaser image gets are the project's decisions, the same kind of thing as tokens, so they
// live here beside them. The SHAPE of a preset is the system's (lib/media.ts); the system
// also names the presets it requires — teaser, quote, hero — and a project must supply them.
import type { CropTable, PicturePreset } from "../lib/media";

/** Crop aspect ratios, by alias (from the first codebase's Image Cropper configuration). */
export const CROPS = {
  stacked: { width: 1600, height: 900 }, // 16:9
  horizontal: { width: 640, height: 640 }, // 1:1
  portrait: { width: 880, height: 1100 }, // 4:5
  mid: { width: 1480, height: 986 }, // 3:2
  wide: { width: 1728, height: 972 }, // 16:9
  mobile: { width: 760, height: 428 }, // 16:9
} as const satisfies CropTable;

export const PRESETS = {
  // Two pictures, CSS/container-query driven visibility (Teaser responsive)
  teaser: {
    loading: "lazy",
    groups: [
      {
        sources: [{ cropAlias: "stacked", widths: [400, 800], sizes: "100%" }],
        cssClass: "StackedSources",
      },
      {
        sources: [{ cropAlias: "horizontal", widths: [320, 640], sizes: "12rem" }],
        cssClass: "HorizontalSources",
      },
    ],
  },

  // One square picture for a thumbnail beside a quote (Quote's --_qt-thumbnailSize)
  quote: {
    loading: "lazy",
    groups: [{ sources: [{ cropAlias: "horizontal", widths: [224, 448], sizes: "7rem" }] }],
  },

  // Single picture, HTML art direction via media queries
  hero: {
    loading: "eager",
    figureCssClass: "grid-container-full",
    groups: [
      {
        sources: [
          { cropAlias: "mobile", widths: [380, 760], sizes: "100vw", media: "(max-width: 21.24999rem)" },
          { cropAlias: "portrait", widths: [440, 880], sizes: "100vw", media: "(max-width: 48rem)" },
          { cropAlias: "mid", widths: [740, 1480], sizes: "100vw", media: "(max-width: 64rem)" },
          { cropAlias: "wide", widths: [1280, 1512, 1728], sizes: "60vw", media: "(min-width: 64rem)" },
        ],
      },
    ],
  },
} as const satisfies Record<string, PicturePreset>;
