// Quote — the React renderer of lib/quote.ts. Same recipe, same markup; React idioms
// only where the host framework differs: children instead of a slot, and a plain
// <img> for the portrait — the responsive picture is Astro's media pipeline, which
// a React tree cannot call. The echo is the same image, blurred by Quote.css.
import type { ReactNode } from "react";
import { createElement, Fragment } from "react";
import "./Quote.css";
import { resolveQuote } from "../../lib/quote";

export interface QuoteImage {
  src: string;
  width?: number;
  height?: number;
}

export interface QuoteProps {
  quote?: string;
  source?: string;
  image?: QuoteImage | null;
  alt?: string;
  size?: string;
  id?: string;
  capInline?: boolean;
  className?: string;
  children?: ReactNode;
  [key: string]: unknown;
}

const h = createElement;

export default function Quote({ quote, source, image = null, alt, size, id, capInline, className, children, ...rest }: QuoteProps) {
  const hasChildContent = children != null && children !== false && children !== "";
  const q = resolveQuote({ id, size, source, hasMedia: image != null, hasQuote: hasChildContent || !!quote?.trim(), capInline });

  if (q.mode === "suppress") return null;
  if (q.mode === "error") {
    if (process.env.NODE_ENV === "production") return null;
    return h("div", { style: { color: "red", border: "2px solid red", padding: "0.5rem" } }, `× Quote: ${q.errorMessage}`);
  }

  const words = hasChildContent ? children : quote;
  const cssClass = className && className.trim() ? `Quote ${className}` : q.className;

  return h(
    q.tag,
    { className: cssClass, ...q.attrs, ...rest },
    h(
      "div",
      { className: "body" },
      h("svg", { className: "mark", "aria-hidden": "true", focusable: "false" }, h("use", { href: "#icon-quote" })),
      q.tag === "aside"
        ? h("p", { className: "quote", id: q.quoteId ?? undefined }, words)
        : h("blockquote", { className: "quote" }, hasChildContent ? children : h("p", null, quote)),
      image &&
        h(
          "div",
          { className: "thumbnail" },
          h("figure", { className: "portrait" }, h("img", { src: image.src, width: image.width, height: image.height, alt: alt ?? "", loading: "lazy", decoding: "async" })),
          h("img", { className: "echo", src: image.src, width: 64, height: 64, alt: "", "aria-hidden": "true", loading: "lazy", decoding: "async" }),
        ),
      q.hasSource && h("figcaption", { className: "source" }, source),
    ),
  );
}
