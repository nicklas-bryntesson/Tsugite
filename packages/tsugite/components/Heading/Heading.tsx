// Heading — the React renderer of the typography recipe (lib/typography.ts). Same
// recipe, same markup; the run's HTML from the text prop (escaped, highlighted) goes
// in with dangerouslySetInnerHTML, children go in as children.
import type { ReactNode } from "react";
import { createElement } from "react";
import "./Heading.css";
import { resolveTypography } from "../../lib/typography";

export interface HeadingProps {
  text?: string;
  highlight?: string;
  href?: string;
  element?: string;
  size?: string;
  variant?: string;
  align?: string;
  wrap?: string;
  className?: string;
  children?: ReactNode;
  [key: string]: unknown;
}

const h = createElement;

export default function Heading({ text, highlight, href, element, size, variant, align, wrap, className, children, ...rest }: HeadingProps) {
  const hasChildContent = children != null && children !== false && children !== "";
  const t = resolveTypography("Heading", { text, highlight, href, element, size, variant, align, wrap, class: className, hasChildContent });

  if (t.mode === "suppress") return null;
  if (t.mode === "error") {
    if (process.env.NODE_ENV === "production") return null;
    return h("div", { style: { color: "red", border: "2px solid red", padding: "0.5rem" } }, `× Heading: ${t.errorMessage}`);
  }

  const container = hasChildContent
    ? h("span", { className: t.container.className }, children)
    : h(t.container.tag, {
        // the link writes href before class, as the Astro renderer and the contract tests do
        ...(t.container.href ? { href: t.container.href } : {}),
        className: t.container.className,
        dangerouslySetInnerHTML: { __html: t.innerHtml ?? "" },
      });

  return h(t.tag, { className: t.className, ...t.attrs, ...rest }, container);
}
