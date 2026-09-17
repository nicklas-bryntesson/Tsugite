// Picture — the recipe: validates the image and the preset name every renderer needs
// before it can call the media pipeline (ADR-0017). The pipeline itself is Astro's.
import { PRESETS, type PicturePreset } from "./media";

export interface PictureInput {
  hasImage: boolean;
  preset?: string;
}

export interface PictureResolution {
  mode: "render" | "error";
  errorMessage: string;
  preset: PicturePreset | null;
}

export function resolvePicture(input: PictureInput): PictureResolution {
  const name = input.preset ?? "";
  if (!input.hasImage) return { mode: "error", errorMessage: "image is required", preset: null };
  if (!PRESETS[name]) {
    return { mode: "error", errorMessage: `unknown preset "${name}" — expected: ${Object.keys(PRESETS).join(" | ")}`, preset: null };
  }
  return { mode: "render", errorMessage: "", preset: PRESETS[name] };
}
