// ItemGridItem — the React renderer of itemGridItem in recipes/itemgrid.recipe.ts: the
// cell one item of an ItemGrid stands in. ItemGrid.css styles it as the .item part.
import type { ReactNode } from "react";
import { createElement } from "react";
import "../../../kernel/css/debug.css";
import { itemGridItem } from "../../../recipes/itemgrid.recipe";
import { resolve, type InputOf } from "../../../lib/recipe";

export type ItemGridItemProps = Omit<InputOf<typeof itemGridItem>, "class"> & {
  className?: string;
  children?: ReactNode;
  [key: string]: unknown;
};

export default function ItemGridItem({ className, children, ...props }: ItemGridItemProps) {
  const r = resolve(itemGridItem, { ...props, class: className }, { hasContent: children != null && children !== false && children !== "" });

  if (r.mode === "suppress") return null;
  if (r.mode === "error") {
    // Mirrors DevError: visible in development, silent in production.
    if (process.env.NODE_ENV === "production") return null;
    return createElement(
      "div",
      { style: { color: "var(--debug-ink)", border: "2px solid var(--debug-ink)", padding: "0.5rem" } },
      `× ${itemGridItem.name}: ${r.errorMessage}`,
    );
  }

  return createElement(r.tag, { className: r.className, ...r.attrs, ...r.rest }, children);
}
