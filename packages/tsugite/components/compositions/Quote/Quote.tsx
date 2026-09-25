// Quote — the React renderer of recipes/quote.recipe.ts. Same table, same markup; React
// idioms only where the host differs: children instead of a slot, and a plain <img> for the
// portrait — the responsive picture is the host's media pipeline, which a React tree cannot
// call (a Picture plan could be passed in instead). The echo is the same image, blurred.
import type { ReactNode } from "react";
import { createElement } from "react";
import "./Quote.css";
import "../../../kernel/css/debug.css";
import { quote as recipe } from "../../../recipes/quote.recipe";
import { resolve, type InputOf } from "../../../lib/recipe";
import { quoteDefaults, quoteDerive, quotePlan } from "../../../lib/quote";

export interface QuoteImage {
  src: string;
  width?: number;
  height?: number;
}

export type QuoteProps = Omit<InputOf<typeof recipe>, "class"> & {
  image?: QuoteImage | null;
  alt?: string;
  className?: string;
  children?: ReactNode;
  [key: string]: unknown;
};

const h = createElement;

export default function Quote({ image = null, alt, className, children, ...props }: QuoteProps) {
  const hasChildren = children != null && children !== false && children !== "";
  const q = resolve(recipe, { ...props, class: className }, {
    slots: { children: hasChildren, media: image != null },
    derive: quoteDerive,
    defaults: quoteDefaults,
  });

  if (q.mode === "suppress") return null;
  if (q.mode === "error") {
    if (process.env.NODE_ENV === "production") return null;
    return h("div", { style: { color: "var(--debug-ink)", border: "2px solid var(--debug-ink)", padding: "0.5rem" } }, `× ${recipe.name}: ${q.errorMessage}`);
  }
  const plan = quotePlan(q);

  return h(
    q.tag,
    { className: q.className, ...q.attrs, ...q.rest },
    h(
      "div",
      { className: "body" },
      h("svg", { className: "mark", "aria-hidden": "true", focusable: "false" }, h("use", { href: "#icon-quote" })),
      q.tag === "aside"
        ? h("p", { className: "quote", id: plan.quoteId ?? undefined }, hasChildren ? children : plan.words)
        : h("blockquote", { className: "quote" }, hasChildren ? children : h("p", null, plan.words)),
      image &&
        h(
          "div",
          { className: "thumbnail" },
          h("figure", { className: "Picture portrait" }, h("img", { src: image.src, width: image.width, height: image.height, alt: alt ?? "", loading: "lazy", decoding: "async" })),
          h("img", { className: "echo", src: image.src, width: 64, height: 64, alt: "", "aria-hidden": "true", loading: "lazy", decoding: "async" }),
        ),
      q.parts.source && h("figcaption", { className: "source" }, plan.source),
    ),
  );
}
