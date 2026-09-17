// Button — the React renderers of lib/button.ts: LinkButton (<a>) and ActionButton
// (<button>). Same recipe, same markup; React idioms only where the host differs.
import type { ReactNode } from "react";
import { createElement } from "react";
import "./Button.css";
import { resolveButton, type ButtonInput } from "../../lib/button";

interface SharedProps {
  emphasis?: string;
  pill?: boolean;
  growInline?: boolean;
  size?: string;
  icon?: string;
  iconPosition?: string;
  ariaLabel?: string;
  className?: string;
  children?: ReactNode;
  [key: string]: unknown;
}
export interface LinkButtonProps extends SharedProps { href?: string; target?: string; }
export interface ActionButtonProps extends SharedProps { buttonType?: string; disabled?: boolean; intent?: string; }

const h = createElement;

function render(input: ButtonInput, name: string, children: ReactNode, rest: Record<string, unknown>) {
  const b = resolveButton(input);
  if (b.mode === "suppress") return null;
  if (b.mode === "error") {
    if (process.env.NODE_ENV === "production") return null;
    return h("div", { style: { color: "red", border: "2px solid red", padding: "0.5rem" } }, `× ${name}: ${b.errorMessage}`);
  }
  const attrs: Record<string, unknown> = { className: b.className, ...b.attrs, ...rest };
  if (b.disabled) attrs.disabled = true;
  return h(
    b.tag,
    attrs,
    input.hasText && h("span", { className: "Button-text" }, children),
    b.iconName && h("svg", { className: "Button-icon", "aria-hidden": "true", focusable: "false" }, h("use", { href: `#${b.iconName}` })),
  );
}

const hasContent = (c: ReactNode) => c != null && c !== false && c !== "";

export function LinkButton({ href, target, emphasis, pill, growInline, size, icon, iconPosition, ariaLabel, className, children, ...rest }: LinkButtonProps) {
  return render({ kind: "link", href, target, emphasis, pill, growInline, size, icon, iconPosition, ariaLabel, class: className, hasText: hasContent(children) }, "LinkButton", children, rest);
}

export function ActionButton({ buttonType, disabled, emphasis, intent = "neutral", pill, growInline, size, icon, iconPosition, ariaLabel, className, children, ...rest }: ActionButtonProps) {
  return render({ kind: "action", buttonType, disabled, emphasis, intent, pill, growInline, size, icon, iconPosition, ariaLabel, class: className, hasText: hasContent(children) }, "ActionButton", children, rest);
}
