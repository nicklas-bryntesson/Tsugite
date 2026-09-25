// Media — the plan (ADR-0018 §7). Three things used to live in one file: the brand's
// tables (crops, presets — now theme-default/media.presets.ts), URL resolution (Astro's
// getImage — now lib/media.astro.ts) and markup emission (an HTML string). This file is
// what is left when those are taken out: the SHAPE of a preset, and `resolveMedia`, which
// turns a preset, an image and a resolver into a plan — plain data with finished srcsets —
// that every renderer writes in its own idiom. `mediaPlanHtml` is the string pen.
//
// The resolver is the only thing that varies, and it varies with the asset pipeline a site
// runs on, not with the UI framework: a Vue Picture and a React Picture in the same Astro
// site share the same resolver.
import { escapeHtml } from "./html";

// ── The shape of a preset (the system's) ──────────────────────────────────────

/** One source group within a picture element — one format triplet (avif/webp/fallback) at one breakpoint. */
export interface SourceDefinition {
  readonly cropAlias: string;
  readonly widths: readonly number[];
  readonly sizes: string;
  /** media query for art direction; absent = resolution switching */
  readonly media?: string | null;
}

/** One picture element — one or more source definitions. */
export interface PictureGroup {
  readonly sources: readonly SourceDefinition[];
  /** CSS class on the picture element */
  readonly cssClass?: string | null;
}

/** Full preset — what a single Picture call resolves to. */
export interface PicturePreset {
  readonly groups: readonly PictureGroup[];
  /** extra class on the figure */
  readonly figureCssClass?: string | null;
  readonly loading: "lazy" | "eager";
}

export type CropTable = Readonly<Record<string, { readonly width: number; readonly height: number }>>;

// ── The resolver (the host's) ──────────────────────────────────────────────────

export type ImageFormat = "avif" | "webp" | null;

/** Given an image, a rendered size and a format: a URL. Astro assets, a CDN, a folder. */
export type UrlResolver<Image> = (image: Image, width: number, height: number, format: ImageFormat) => Promise<string>;

// ── The plan (what renderers write) ───────────────────────────────────────────

export interface MediaSource {
  /** "image/avif", "image/webp", or null for the fallback source */
  readonly type: string | null;
  readonly media: string | null;
  readonly srcset: string;
  readonly sizes: string;
}

export interface MediaPicture {
  readonly className: string;
  readonly sources: readonly MediaSource[];
  readonly img: {
    readonly src: string;
    /** null under art direction: the sources carry the candidates */
    readonly srcset: string | null;
    readonly sizes: string | null;
    readonly alt: string;
    readonly loading: "lazy" | "eager";
  };
}

export interface MediaPlan {
  readonly mode: "render";
  readonly className: string;
  readonly pictures: readonly MediaPicture[];
}

export interface MediaError {
  readonly mode: "error";
  readonly errorMessage: string;
}

export interface MediaInput<Image> {
  image: Image | null | undefined;
  /** the preset NAME; the tables decide what it means */
  preset: string | undefined;
  alt?: string | null;
  /** overrides the preset's default */
  loading?: string | null;
  /** the figure's class as the recipe resolved it ("Picture", "Picture extra"); the preset may add one */
  className?: string;
  /** the picture elements' base class */
  pictureClass?: string;
}

export interface MediaTables {
  readonly presets: Readonly<Record<string, PicturePreset>>;
  readonly crops: CropTable;
}

// ── resolveMedia ──────────────────────────────────────────────────────────────

export async function resolveMedia<Image>(
  input: MediaInput<Image>,
  tables: MediaTables,
  resolver: UrlResolver<Image>,
): Promise<MediaPlan | MediaError> {
  const name = input.preset ?? "";
  if (input.image == null) return { mode: "error", errorMessage: "image is required" };
  const preset = tables.presets[name];
  if (!preset) return { mode: "error", errorMessage: `unknown preset "${name}" — expected: ${Object.keys(tables.presets).join(" | ")}` };
  const loading = input.loading ?? preset.loading;
  if (loading !== "lazy" && loading !== "eager") return { mode: "error", errorMessage: `invalid loading "${input.loading}" — expected lazy | eager` };
  for (const group of preset.groups) for (const source of group.sources) {
    if (!tables.crops[source.cropAlias]) return { mode: "error", errorMessage: `unknown crop "${source.cropAlias}" in preset "${name}"` };
  }

  const image = input.image;
  const alt = input.alt ?? "";
  const url = (source: SourceDefinition, width: number, format: ImageFormat) => {
    const crop = tables.crops[source.cropAlias];
    return resolver(image, width, Math.round((width * crop.height) / crop.width), format);
  };
  const srcset = async (source: SourceDefinition, format: ImageFormat) =>
    (await Promise.all(source.widths.map(async (w) => `${await url(source, w, format)} ${w}w`))).join(", ");

  const pictureBase = input.pictureClass ?? "group";
  const pictures: MediaPicture[] = [];
  for (const group of preset.groups) {
    const artDirection = group.sources.some((s) => s.media != null);
    const last = group.sources[group.sources.length - 1];
    const sources: MediaSource[] = [];
    for (const source of group.sources) {
      const media = source.media ?? null;
      sources.push({ type: "image/avif", media, srcset: await srcset(source, "avif"), sizes: source.sizes });
      sources.push({ type: "image/webp", media, srcset: await srcset(source, "webp"), sizes: source.sizes });
      sources.push({ type: null, media, srcset: await srcset(source, null), sizes: source.sizes });
    }
    pictures.push({
      className: group.cssClass ? `${pictureBase} ${group.cssClass}` : pictureBase,
      sources,
      img: {
        src: await url(last, last.widths[0], null),
        srcset: artDirection ? null : await srcset(last, null),
        sizes: artDirection ? null : last.sizes,
        alt,
        loading,
      },
    });
  }

  const className = [input.className ?? "Picture", preset.figureCssClass].filter((c): c is string => !!c && c.trim().length > 0).join(" ");
  return { mode: "render", className, pictures };
}

// ── The string pen, for string-building renderers ─────────────────────────────

export function mediaPlanHtml(plan: MediaPlan): string {
  let html = `<figure class="${escapeHtml(plan.className)}">`;
  for (const picture of plan.pictures) {
    html += `<picture class="${escapeHtml(picture.className)}">`;
    for (const s of picture.sources) {
      const type = s.type ? ` type="${s.type}"` : "";
      const media = s.media ? ` media="${escapeHtml(s.media)}"` : "";
      html += `<source${type}${media} srcset="${escapeHtml(s.srcset)}" sizes="${escapeHtml(s.sizes)}">`;
    }
    const { img } = picture;
    const srcset = img.srcset ? ` srcset="${escapeHtml(img.srcset)}" sizes="${escapeHtml(img.sizes ?? "")}"` : "";
    html += `<img src="${escapeHtml(img.src)}"${srcset} alt="${escapeHtml(img.alt)}" loading="${img.loading}" decoding="async">`;
    html += "</picture>";
  }
  return html + "</figure>";
}
