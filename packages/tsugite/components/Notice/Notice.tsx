// Notice — the React renderer of recipes/notice.recipe.ts. Same table, same markup; React
// idioms only where the host differs: children for the body, `actions` and `dismiss` as
// node props for the named slots, dangerouslySetInnerHTML for the icon path.
import type { ReactNode } from "react";
import { createElement } from "react";
import "./Notice.css";
import "../../kernel/css/debug.css";
import { notice } from "../../recipes/notice.recipe";
import { resolve, type InputOf } from "../../lib/recipe";
import { noticeDerive, NOTICE_ICONS } from "../../lib/notice";

export type NoticeProps = Omit<InputOf<typeof notice>, "class"> & {
  className?: string;
  children?: ReactNode;
  /** buttons under the body; the host sizes them, Notice arranges them */
  actions?: ReactNode;
  /** the dismiss control in the top-end corner; the host owns what it does */
  dismiss?: ReactNode;
  [key: string]: unknown;
};

const h = createElement;
const has = (c: ReactNode) => c != null && c !== false && c !== "";

export default function Notice({ className, children, actions, dismiss, ...props }: NoticeProps) {
  const n = resolve(notice, { ...props, class: className }, {
    slots: { body: has(children), actions: has(actions), dismiss: has(dismiss) },
    derive: noticeDerive,
  });
  if (n.mode === "error") {
    if (process.env.NODE_ENV === "production") return null;
    return h("div", { style: { color: "var(--debug-ink)", border: "2px solid var(--debug-ink)", padding: "0.5rem" } }, `× ${notice.name}: ${n.errorMessage}`);
  }
  const variant = n.attrs["data-variant"] as string;
  return h(
    n.tag,
    { className: n.className, ...n.attrs, ...n.rest },
    n.attrs["data-icon"] === "true" &&
      h("div", { className: "icon" },
        h("svg", { width: "24", height: "24", viewBox: "0 0 24 24", "aria-hidden": "true", focusable: "false", dangerouslySetInnerHTML: { __html: NOTICE_ICONS[variant] } })),
    h("div", { className: "content" },
      n.parts.title && h("strong", { className: "title" }, n.parts.title as string),
      children,
      n.parts.actions && h("div", { className: "actions" }, actions)),
    n.parts.dismiss && h("div", { className: "dismiss" }, dismiss),
  );
}
