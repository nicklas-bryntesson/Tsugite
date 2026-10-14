// ItemGrid — the React renderer of recipes/itemgrid.recipe.ts. Same table, same markup;
// React idioms only where the host differs (children instead of a slot, className).
import type { ReactNode } from "react";
import { createElement } from "react";
import "./ItemGrid.css";
import "../../../kernel/css/debug.css";
import { itemGrid } from "../../../recipes/itemgrid.recipe";
import { resolve, type InputOf } from "../../../lib/recipe";
import { itemGridDerive } from "../../../lib/itemgrid";

export type ItemGridProps = Omit<InputOf<typeof itemGrid>, "class"> & {
  className?: string;
  children?: ReactNode;
  [key: string]: unknown;
};

export default function ItemGrid({ className, children, ...props }: ItemGridProps) {
  const r = resolve(
    itemGrid,
    { ...props, class: className },
    { hasContent: children != null && children !== false && children !== "", derive: itemGridDerive },
  );

  if (r.mode === "suppress") return null;
  if (r.mode === "error") {
    // Mirrors DevError: visible in development, silent in production.
    if (process.env.NODE_ENV === "production") return null;
    return createElement(
      "div",
      { style: { color: "var(--debug-ink)", border: "2px solid var(--debug-ink)", padding: "0.5rem" } },
      `× ${itemGrid.name}: ${r.errorMessage}`,
    );
  }

  return createElement(r.tag, { className: r.className, ...r.attrs, ...r.rest }, children);
}
