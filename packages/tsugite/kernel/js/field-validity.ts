// Field validity — one truth for what is seen and what is announced (tasks/plan-fields.md).
//
// The field skin reads `aria-invalid="true"` and nothing else: never `:invalid`, which
// matches an empty required field at load, and never `:user-invalid`, which the floor
// (Chrome 109) does not have. This module sets the attribute from the browser's own
// constraint validation, with `:user-invalid`'s timing:
//
//  1. Leave — a field the user changed is checked when focus leaves it.
//  2. Submit — the browser fires `invalid` on every failing field when a form is
//     submitted; each one is marked, changed or not.
//  3. Correct — a marked field is checked again on every edit, so the mark clears the
//     moment the value is valid.
//
// A server sets the same attribute without this script ("this address is taken"); the
// script leaves a server's mark alone until the user edits the field. Fields opt in by
// matching the selector (the Input root class by default). One set of document listeners,
// installed once, removed when the signal aborts.

const touched = new WeakSet<HTMLInputElement>();
let installed = false;

const fieldOf = (target: EventTarget | null, selector: string): HTMLInputElement | null =>
  target instanceof HTMLInputElement && target.matches(selector) ? target : null;

const mark = (field: HTMLInputElement) => {
  if (field.checkValidity()) field.removeAttribute("aria-invalid");
  else field.setAttribute("aria-invalid", "true");
};

export function attachFieldValidity(selector = ".Input", signal?: AbortSignal): void {
  if (installed) return;
  installed = true;
  const options = { capture: true, signal };

  document.addEventListener(
    "input",
    (event) => {
      const field = fieldOf(event.target, selector);
      if (!field) return;
      touched.add(field);
      // correct: once marked, the mark follows the value
      if (field.getAttribute("aria-invalid") === "true") mark(field);
    },
    options,
  );

  document.addEventListener(
    "focusout",
    (event) => {
      const field = fieldOf(event.target, selector);
      // leave: only a field the user changed — an untouched required field stays quiet
      if (field && touched.has(field)) mark(field);
    },
    options,
  );

  document.addEventListener(
    "invalid",
    (event) => {
      const field = fieldOf(event.target, selector);
      // submit: the browser names every failing field
      if (field) field.setAttribute("aria-invalid", "true");
    },
    options,
  );

  signal?.addEventListener("abort", () => {
    installed = false;
  });
}
