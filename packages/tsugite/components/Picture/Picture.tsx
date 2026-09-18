// Picture — the React pen for a media plan. It takes a FINISHED plan (lib/media.ts):
// resolution is asynchronous and lives at the host boundary, so a React Picture is
// synchronous and pure, and testable against a fixture plan with no pipeline present.
import { createElement } from "react";
import "./Picture.css";
import type { MediaPlan } from "../../lib/media";

const h = createElement;

export interface PictureProps {
  plan: MediaPlan;
}

export default function Picture({ plan }: PictureProps) {
  return h(
    "figure",
    { className: plan.className },
    ...plan.pictures.map((picture, i) =>
      h(
        "picture",
        { className: picture.className, key: i },
        ...picture.sources.map((s, j) => h("source", { key: j, type: s.type ?? undefined, media: s.media ?? undefined, srcSet: s.srcset, sizes: s.sizes })),
        h("img", { src: picture.img.src, srcSet: picture.img.srcset ?? undefined, sizes: picture.img.sizes ?? undefined, alt: picture.img.alt, loading: picture.img.loading, decoding: "async" }),
      ),
    ),
  );
}
