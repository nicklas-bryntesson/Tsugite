// Heading — the React renderer of recipes/heading.recipe.ts. Same table, same markup; the
// run's HTML from the text prop (escaped, highlighted) goes in with dangerouslySetInnerHTML,
// children go in as children.
import type { ReactNode } from "react";
import { createElement } from "react";
import "./Heading.css";
import { heading } from "../../recipes/heading.recipe";
import { resolve, type InputOf } from "../../lib/recipe";
import { headingDefaults, headingDerive, headingPlan } from "../../lib/heading";

export type HeadingProps = Omit<InputOf<typeof heading>, "class"> & {
  className?: string;
  children?: ReactNode;
  [key: string]: unknown;
};

const h = createElement;

export default function Heading({ className, children, ...props }: HeadingProps) {
  const hasChildren = children != null && children !== false && children !== "";
  const t = resolve(heading, { ...props, class: className }, { slots: { children: hasChildren }, derive: headingDerive, defaults: headingDefaults });

  if (t.mode === "suppress") return null;
  if (t.mode === "error") {
    if (process.env.NODE_ENV === "production") return null;
    return h("div", { style: { color: "red", border: "2px solid red", padding: "0.5rem" } }, `× ${heading.name}: ${t.errorMessage}`);
  }

  const plan = headingPlan(t);
  const container = hasChildren
    ? h("span", { className: plan.container.className }, children)
    : h(plan.container.tag, {
        // the link writes href before class, as the Astro renderer and the contract tests do
        ...(plan.container.href ? { href: plan.container.href } : {}),
        className: plan.container.className,
        dangerouslySetInnerHTML: { __html: plan.innerHtml ?? "" },
      });

  return h(t.tag, { className: t.className, ...t.attrs, ...t.rest }, container);
}
