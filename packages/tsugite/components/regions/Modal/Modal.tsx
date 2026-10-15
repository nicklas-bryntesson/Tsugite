// Modal — the React renderer of recipes/modal.recipe.ts. Same table, same markup; React
// idioms only where the host differs (children instead of a slot, className, an effect to
// install the kernel). The name check reads rendered child markup, which a React renderer
// does not have before it renders, so it lives in Modal.astro only.
import type { ReactNode } from "react";
import { createElement, useEffect } from "react";
import "./Modal.css";
import "../../../kernel/css/region.css";
import "../../../kernel/css/debug.css";
import { modal } from "../../../recipes/modal.recipe";
import { resolve, type InputOf } from "../../../lib/recipe";
import { modalDerive } from "../../../lib/modal";
import { installRegionChannels } from "../../../kernel/js/region-channels";

export type ModalProps = Omit<InputOf<typeof modal>, "class"> & {
  className?: string;
  children?: ReactNode;
  [key: string]: unknown;
};

export default function Modal({ className, children, ...props }: ModalProps) {
  useEffect(() => installRegionChannels(), []);

  const r = resolve(
    modal,
    { ...props, class: className },
    { hasContent: children != null && children !== false && children !== "", derive: modalDerive },
  );

  if (r.mode === "suppress") return null;
  if (r.mode === "error") {
    // Mirrors DevError: visible in development, silent in production.
    if (process.env.NODE_ENV === "production") return null;
    return createElement(
      "div",
      { style: { color: "var(--debug-ink)", border: "2px solid var(--debug-ink)", padding: "0.5rem" } },
      `× ${modal.name}: ${r.errorMessage}`,
    );
  }

  return createElement(r.tag, { className: r.className, ...r.attrs, ...r.rest }, children);
}
