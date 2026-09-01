// Port of AiPoc TagHelpers/MediaHelper.cs
//
// Umbraco crop URLs are replaced by astro:assets getImage() (sharp, fit: cover).
// Crop aspect ratios come from the Umbraco Image Cropper data type config.
// The markup produced by buildFigureHtml mirrors MediaHelper.BuildFigureHtml exactly:
// figure.Media > picture.Media-picture(.CssClass) > source(avif/webp/fallback) + img
import { getImage } from "astro:assets";
import type { ImageMetadata } from "astro";
import { escapeHtml } from "./buttonShared";

// ── Records ──────────────────────────────────────────────────────────────────

/** One source group within a picture element — one format triplet (avif/webp/jpg) at one breakpoint. */
export interface SourceDefinition {
  cropAlias: string;
  widths: number[];
  sizes: string;
  /** media query for art direction; null/undefined = resolution switching */
  media?: string | null;
}

/** One picture element — one or more source definitions. */
export interface PictureGroup {
  sources: SourceDefinition[];
  /** CSS class on the picture element */
  cssClass?: string | null;
}

/** Full preset — what a single Picture call resolves to. */
export interface PicturePreset {
  groups: PictureGroup[];
  /** extra class on the figure */
  figureCssClass?: string | null;
  loading: "lazy" | "eager";
}

// ── Crop definitions (from Umbraco Image Cropper config) ─────────────────────

export const CROPS: Record<string, { width: number; height: number }> = {
  stacked: { width: 1600, height: 900 }, // 16:9
  horizontal: { width: 640, height: 640 }, // 1:1
  portrait: { width: 880, height: 1100 }, // 4:5
  mid: { width: 1480, height: 986 }, // 3:2
  wide: { width: 1728, height: 972 }, // 16:9
  mobile: { width: 760, height: 428 }, // 16:9
};

// ── Presets ───────────────────────────────────────────────────────────────────

export const PRESETS: Record<string, PicturePreset> = {
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
};

// ── Crop URL via astro:assets ─────────────────────────────────────────────────

async function cropUrl(
  image: ImageMetadata,
  cropAlias: string,
  width: number,
  format: "avif" | "webp" | null,
): Promise<string> {
  const crop = CROPS[cropAlias];
  const height = Math.round((width * crop.height) / crop.width);

  const result = await getImage({
    src: image,
    width,
    height,
    format: format ?? "jpg",
    fit: "cover",
  });

  return result.src;
}

async function buildSrcset(
  source: SourceDefinition,
  image: ImageMetadata,
  format: "avif" | "webp" | null,
): Promise<string> {
  const entries = await Promise.all(
    source.widths.map(async (w) => `${await cropUrl(image, source.cropAlias, w, format)} ${w}w`),
  );
  return entries.join(", ");
}

// ── Figure builder ────────────────────────────────────────────────────────────

/**
 * Renders a complete figure element with all picture/source/img elements.
 * Mirrors MediaHelper.BuildFigureHtml — loading overrides the preset default,
 * extraClass is appended to the figure class list, figureClass/pictureClass
 * set the base classes.
 */
export async function buildFigureHtml(options: {
  image: ImageMetadata;
  preset: PicturePreset;
  altText: string;
  loading?: string | null;
  extraClass?: string | null;
  figureClass?: string;
  pictureClass?: string;
}): Promise<string> {
  const {
    image,
    preset,
    altText,
    loading = null,
    extraClass = null,
    figureClass = "Media",
    pictureClass = "Media-picture",
  } = options;

  const resolvedLoading = loading ?? preset.loading;
  const encodedAlt = escapeHtml(altText);

  let inner = "";
  for (const group of preset.groups) {
    inner += await renderPictureGroup(group, image, resolvedLoading, encodedAlt, pictureClass);
  }

  const classes = [figureClass, preset.figureCssClass, extraClass]
    .filter((c): c is string => !!c && c.trim().length > 0)
    .join(" ");

  return `<figure class="${classes}">${inner}</figure>`;
}

// ── Private helpers ───────────────────────────────────────────────────────────

async function renderPictureGroup(
  group: PictureGroup,
  image: ImageMetadata,
  loading: string,
  altText: string,
  pictureBaseClass = "Media-picture",
): Promise<string> {
  const isArtDirection = group.sources.some((s) => s.media != null);
  const lastSource = group.sources[group.sources.length - 1];
  const pictureClass = group.cssClass ? `${pictureBaseClass} ${group.cssClass}` : pictureBaseClass;

  let html = `<picture class="${pictureClass}">`;

  for (const source of group.sources) {
    const media = source.media != null ? ` media="${source.media}"` : "";

    html += `<source type="image/avif"${media} srcset="${await buildSrcset(source, image, "avif")}" sizes="${source.sizes}">`;
    html += `<source type="image/webp"${media} srcset="${await buildSrcset(source, image, "webp")}" sizes="${source.sizes}">`;
    html += `<source${media} srcset="${await buildSrcset(source, image, null)}" sizes="${source.sizes}">`;
  }

  const imgSrc = await cropUrl(image, lastSource.cropAlias, lastSource.widths[0], null);

  if (isArtDirection) {
    html += `<img src="${imgSrc}" alt="${altText}" loading="${loading}" decoding="async">`;
  } else {
    html += `<img src="${imgSrc}" srcset="${await buildSrcset(lastSource, image, null)}" sizes="${lastSource.sizes}" alt="${altText}" loading="${loading}" decoding="async">`;
  }

  html += "</picture>";
  return html;
}
