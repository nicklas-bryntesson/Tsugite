// NavItem — the React front doors to recipes/navitem.recipe.ts: NavLink (<a>) and NavButton
// (<button>). Same table, same markup; React idioms only where the host differs.
import type { ReactNode } from "react";
import { createElement } from "react";
import "./NavItem.css";
import "../../kernel/css/debug.css";
import { navitem } from "../../recipes/navitem.recipe";
import { resolve, type InputOf } from "../../lib/recipe";
import { navItemDerive } from "../../lib/navitem";

type Input = InputOf<typeof navitem>;
type Shared = Omit<Input, "element" | "class" | "aria-label" | "aria-controls" | "href" | "target" | "type" | "expanded"> & {
  ariaLabel?: string;
  className?: string;
  children?: ReactNode;
  [key: string]: unknown;
};
export type NavLinkProps = Shared & { href?: string; target?: string };
export type NavButtonProps = Shared & { expanded?: boolean; ariaControls?: string };

const h = createElement;
const hasContent = (c: ReactNode) => c != null && c !== false && c !== "";

function render(element: "a" | "button", name: string, props: Record<string, unknown>, children: ReactNode) {
  const { ariaLabel, ariaControls, className, ...rest } = props;
  const n = resolve(
    navitem,
    { ...rest, element, class: className, "aria-label": ariaLabel, "aria-controls": ariaControls },
    { slots: { text: hasContent(children) }, derive: navItemDerive },
  );
  if (n.mode === "suppress") return null;
  if (n.mode === "error") {
    if (process.env.NODE_ENV === "production") return null;
    return h("div", { style: { color: "var(--debug-ink)", border: "2px solid var(--debug-ink)", padding: "0.5rem" } }, `× ${name}: ${n.errorMessage}`);
  }
  return h(
    n.tag,
    { className: n.className, ...n.attrs, ...n.rest },
    n.parts.text && h("span", { className: "NavItem-text" }, children),
    n.parts.icon && h("svg", { className: "NavItem-icon", "aria-hidden": "true", focusable: "false" }, h("use", { href: `#${n.parts.icon}` })),
  );
}

export function NavLink({ children, ...props }: NavLinkProps) {
  return render("a", "NavLink", props, children);
}

export function NavButton({ children, ...props }: NavButtonProps) {
  return render("button", "NavButton", props, children);
}
