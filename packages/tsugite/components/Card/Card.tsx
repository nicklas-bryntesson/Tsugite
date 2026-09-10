// Card — the React renderer of lib/card.ts. Same recipe, same markup; React idioms
// only where the host framework differs (children instead of a slot).
import type { ReactNode } from "react";
import { createElement } from "react";
import "./Card.css";
import { resolveCard } from "../../lib/card";

export interface CardProps {
  element?: string;
  padding?: string;
  border?: boolean;
  elevation?: string;
  className?: string;
  children?: ReactNode;
  [key: string]: unknown;
}

export default function Card({ element, padding, border, elevation, className, children, ...rest }: CardProps) {
  const card = resolveCard({
    element,
    padding,
    border,
    elevation,
    class: className,
    hasContent: children != null && children !== false && children !== "",
  });

  if (card.mode === "suppress") return null;
  if (card.mode === "error") {
    // Mirrors DevError: visible in development, silent in production.
    if (process.env.NODE_ENV === "production") return null;
    return createElement(
      "div",
      { style: { color: "red", border: "2px solid red", padding: "0.5rem" } },
      `\u00d7 Card: ${card.errorMessage}`,
    );
  }

  return createElement(card.tag, { className: card.className, ...card.attrs, ...rest }, children);
}
