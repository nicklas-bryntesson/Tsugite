// CtaButton — the React front doors to recipes/ctabutton.recipe.ts: CtaLinkButton (<a>)
// and CtaActionButton (<button>). Same table, same markup; React idioms only where the
// host differs.
import type { ReactNode } from "react";
import { createElement } from "react";
import "./CtaButton.css";
import "../../../../kernel/css/debug.css";
import { ctabutton } from "../../../../recipes/ctabutton.recipe";
import { resolve, type InputOf } from "../../../../lib/recipe";
import { CTA_LAYERS } from "../../../../lib/ctabutton";

type Input = InputOf<typeof ctabutton>;
type Shared = Omit<Input, "element" | "class" | "aria-label" | "href" | "target" | "type" | "disabled"> & {
  ariaLabel?: string;
  className?: string;
  children?: ReactNode;
  [key: string]: unknown;
};
export type CtaLinkButtonProps = Shared & { href?: string; target?: string };
export type CtaActionButtonProps = Shared & { buttonType?: string; disabled?: boolean };

const h = createElement;
const hasContent = (c: ReactNode) => c != null && c !== false && c !== "";

function render(element: "a" | "button", name: string, props: Record<string, unknown>, children: ReactNode) {
  const { ariaLabel, className, buttonType, ...rest } = props;
  const c = resolve(ctabutton, { ...rest, element, class: className, "aria-label": ariaLabel, type: buttonType }, { slots: { text: hasContent(children) } });
  if (c.mode === "suppress") return null;
  if (c.mode === "error") {
    if (process.env.NODE_ENV === "production") return null;
    return h("div", { style: { color: "var(--debug-ink)", border: "2px solid var(--debug-ink)", padding: "0.5rem" } }, `× ${name}: ${c.errorMessage}`);
  }
  const layers = (CTA_LAYERS[c.attrs["data-variant"] as string] ?? []).map((l) => h("span", { key: l, className: `CtaButton-${l}`, "aria-hidden": "true" }));
  return h(
    c.tag,
    { className: c.className, ...c.attrs, ...c.rest },
    ...layers,
    c.parts.text && h("span", { className: "CtaButton-text" }, children),
    c.parts.icon && h("svg", { className: "CtaButton-icon", "aria-hidden": "true", focusable: "false" }, h("use", { href: `#${c.parts.icon}` })),
  );
}

export function CtaLinkButton({ children, ...props }: CtaLinkButtonProps) {
  return render("a", "CtaLinkButton", props, children);
}

export function CtaActionButton({ children, ...props }: CtaActionButtonProps) {
  return render("button", "CtaActionButton", props, children);
}
