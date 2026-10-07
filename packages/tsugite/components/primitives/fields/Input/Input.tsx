// Input — the React front door to recipes/input.recipe.ts: one native text field. Same
// table, same markup as Input.astro; React idioms only where the host differs. The
// kernel's field-validity script is installed once, on the first mount.
import { createElement, useEffect } from "react";
import "../../../../kernel/css/text-box.generated.css";
import "./Input.css";
import "../../../../kernel/css/debug.css";
import { input as recipe } from "../../../../recipes/input.recipe";
import { resolve, type InputOf } from "../../../../lib/recipe";
import { inputDerive } from "../../../../lib/input";
import { attachFieldValidity } from "../../../../kernel/js/field-validity";

export type InputProps = Omit<InputOf<typeof recipe>, "element" | "class" | "readonly"> & {
  className?: string;
  readOnly?: boolean;
  [key: string]: unknown;
};

const h = createElement;

export function Input({ className, readOnly, ...props }: InputProps) {
  useEffect(() => attachFieldValidity(), []);
  const r = resolve(recipe, { ...props, readonly: readOnly, element: "input", class: className }, { derive: inputDerive });
  if (r.mode === "suppress") return null;
  if (r.mode === "error") {
    if (process.env.NODE_ENV === "production") return null;
    return h("div", { style: { color: "var(--debug-ink)", border: "2px solid var(--debug-ink)", padding: "0.5rem" } }, `× Input: ${r.errorMessage}`);
  }
  // React names, in the table's order: readonly → readOnly, a bare boolean → true, and
  // value as a default, so the field stays uncontrolled.
  const attrs: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(r.attrs)) {
    const name = key === "readonly" ? "readOnly" : key === "value" ? "defaultValue" : key === "minlength" ? "minLength" : key === "maxlength" ? "maxLength" : key === "inputmode" ? "inputMode" : key === "autocomplete" ? "autoComplete" : key;
    attrs[name] = val === true ? true : val;
  }
  return h("input", { className: r.className, ...attrs, ...r.rest });
}
