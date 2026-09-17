// Notice — the React renderer of lib/notice.ts. Same recipe, same markup; React
// idioms only where the host framework differs (children, dangerouslySetInnerHTML
// for the icon path).
import type { ReactNode } from "react";
import { createElement } from "react";
import "./Notice.css";
import { resolveNotice } from "../../lib/notice";

export interface NoticeProps {
  variant?: string;
  icon?: boolean;
  border?: boolean;
  emphasis?: boolean;
  title?: string;
  growInline?: boolean;
  capInline?: boolean;
  className?: string;
  children?: ReactNode;
  [key: string]: unknown;
}

const h = createElement;

export default function Notice({ variant, icon, border, emphasis, title, growInline, capInline, className, children, ...rest }: NoticeProps) {
  const n = resolveNotice({ variant, icon, border, emphasis, growInline, capInline, class: className });
  if (n.mode === "error") {
    if (process.env.NODE_ENV === "production") return null;
    return h("div", { style: { color: "red", border: "2px solid red", padding: "0.5rem" } }, `× Notice: ${n.errorMessage}`);
  }
  return h(
    "div",
    { className: n.className, ...n.attrs, ...rest },
    n.icon &&
      h("div", { className: "icon" },
        h("svg", { width: "24", height: "24", viewBox: "0 0 24 24", "aria-hidden": "true", focusable: "false", dangerouslySetInnerHTML: { __html: n.iconPath } })),
    h("div", { className: "content" }, title && h("strong", { className: "title" }, title), children),
  );
}
