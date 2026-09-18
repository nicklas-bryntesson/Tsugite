// The Astro resolver: one URL per rendered size, through astro:assets (sharp, fit: cover).
// This is the only file in the media chain that knows the asset pipeline. Another host
// supplies another function with the same signature; the plan and the pens do not change.
import { getImage } from "astro:assets";
import type { ImageMetadata } from "astro";
import type { UrlResolver } from "./media";
import { CROPS, PRESETS } from "../theme-default/media.presets";

export const astroImageResolver: UrlResolver<ImageMetadata> = async (image, width, height, format) =>
  (await getImage({ src: image, width, height, format: format ?? "jpg", fit: "cover" })).src;

/** The brand's tables, bundled for the Astro renderers. */
export const mediaTables = { presets: PRESETS, crops: CROPS };
