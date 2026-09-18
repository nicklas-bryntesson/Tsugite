// Card — the React renderer of recipes/card.recipe.ts. Same table, same markup; React
// idioms only where the host differs (children instead of a slot, className).
import type { ReactNode } from "react";
import { createElement } from "react";
import "./Card.css";
import { card } from "../../recipes/card.recipe";
import { resolve, type InputOf } from "../../lib/recipe";

export type CardProps = Omit<InputOf<typeof card>, "class"> & {
  className?: string;
  children?: ReactNode;
  [key: string]: unknown;
};

export default function Card({ className, children, ...props }: CardProps) {
  const r = resolve(card, { ...props, class: className }, { hasContent: children != null && children !== false && children !== "" });

  if (r.mode === "suppress") return null;
  if (r.mode === "error") {
    // Mirrors DevError: visible in development, silent in production.
    if (process.env.NODE_ENV === "production") return null;
    return createElement(
      "div",
      { style: { color: "red", border: "2px solid red", padding: "0.5rem" } },
      `× ${card.name}: ${r.errorMessage}`,
    );
  }

  return createElement(r.tag, { className: r.className, ...r.attrs, ...r.rest }, children);
}
