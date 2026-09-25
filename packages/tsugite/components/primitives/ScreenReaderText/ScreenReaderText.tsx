// ScreenReaderText — the React renderer of recipes/screenreadertext.recipe.ts. Same
// table, same markup; React idioms where the host differs (children, className). The
// interactive-content refusal cannot inspect a ReactNode tree cheaply, so React relies
// on the author; the Astro renderer and the docs show the rule.
import type { ReactNode } from "react";
import { createElement } from "react";
import "./ScreenReaderText.css";
import "../../../kernel/css/debug.css";
import { screenReaderText as recipe } from "../../../recipes/screenreadertext.recipe";
import { resolve, type InputOf } from "../../../lib/recipe";

export type ScreenReaderTextProps = Omit<InputOf<typeof recipe>, "class" | "element"> & {
  className?: string;
  children?: ReactNode;
  [key: string]: unknown;
};

const hasContent = (c: ReactNode) => c != null && c !== false && c !== "";

export default function ScreenReaderText({ className, children, ...props }: ScreenReaderTextProps) {
  const r = resolve(recipe, { ...props, class: className }, { slots: { children: hasContent(children) } });
  if (r.mode === "suppress") return null;
  if (r.mode === "error") {
    if (process.env.NODE_ENV === "production") return null;
    return createElement(
      "div",
      { style: { color: "var(--debug-ink)", border: "2px solid var(--debug-ink)", padding: "0.5rem" } },
      `× ${recipe.name}: ${r.errorMessage}`,
    );
  }
  return createElement("span", { className: r.className, ...r.attrs, ...r.rest }, r.parts.children ? children : (r.parts.text as string));
}
