// Button — the React front doors to recipes/button.recipe.ts: LinkButton (<a>) and
// ActionButton (<button>). Same table, same markup; React idioms only where the host
// differs (children instead of a slot, className, camelCase attribute props).
import type { ReactNode } from "react";
import { createElement } from "react";
import "./Button.css";
import "../../ScreenReaderText/ScreenReaderText.css";
import "../../../../kernel/css/debug.css";
import { button } from "../../../../recipes/button.recipe";
import { resolve, type InputOf } from "../../../../lib/recipe";
import { buttonDerive } from "../../../../lib/button";

type Input = InputOf<typeof button>;
type Shared = Omit<Input, "element" | "class" | "aria-label" | "href" | "target" | "type" | "disabled" | "intent"> & {
  ariaLabel?: string;
  className?: string;
  children?: ReactNode;
  [key: string]: unknown;
};
export type LinkButtonProps = Shared & { href?: string; target?: string };
export type ActionButtonProps = Shared & { buttonType?: string; disabled?: boolean; intent?: Input["intent"] };

const h = createElement;
const hasContent = (c: ReactNode) => c != null && c !== false && c !== "";

function render(element: "a" | "button", name: string, props: Record<string, unknown>, children: ReactNode) {
  const { ariaLabel, className, buttonType, ...rest } = props;
  const b = resolve(
    button,
    { ...rest, element, class: className, "aria-label": ariaLabel, type: buttonType },
    { slots: { text: hasContent(children) }, derive: buttonDerive },
  );
  if (b.mode === "suppress") return null;
  if (b.mode === "error") {
    if (process.env.NODE_ENV === "production") return null;
    return h("div", { style: { color: "var(--debug-ink)", border: "2px solid var(--debug-ink)", padding: "0.5rem" } }, `× ${name}: ${b.errorMessage}`);
  }
  return h(
    b.tag,
    { className: b.className, ...b.attrs, ...b.rest },
    b.parts.text && h("span", { className: "Button-text" }, children, b.parts.srText && h("span", { className: "ScreenReaderText" }, b.parts.srText)),
    b.parts.icon && h("svg", { className: "Button-icon", "aria-hidden": "true", focusable: "false" }, h("use", { href: `#${b.parts.icon}` })),
  );
}

export function LinkButton({ children, ...props }: LinkButtonProps) {
  return render("a", "LinkButton", props, children);
}

export function ActionButton({ children, ...props }: ActionButtonProps) {
  return render("button", "ActionButton", props, children);
}
