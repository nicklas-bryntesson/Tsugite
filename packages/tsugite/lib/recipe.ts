// The recipe interpreter (ADR-0018). A recipe is a table in recipes/<name>.recipe.ts:
// the element, the closed axes in DOM order, what an empty component does. This is the
// one function that reads those tables — for every component, in every renderer. It
// resolves props to a tag, a class, the data-* attributes in write order and a mode,
// and it is the only place the error rule (ADR-0019) is implemented.
//
// It grows with the recipes: host attributes, parts, derived flags, `when` and `absent`
// arrive with the components that need them (Button, Teaser). Card needs none of them.

export interface EnumAxis {
  readonly values: readonly string[];
  readonly default: string;
}

export interface BooleanAxis {
  readonly type: "boolean";
  readonly default: boolean;
}

export type Axis = EnumAxis | BooleanAxis;

export interface Recipe {
  readonly name: string;
  /** the root class the CSS gates on */
  readonly class: string;
  /** the permitted tags; an invalid one falls back to the default (ADR-0019) */
  readonly element: { readonly values: readonly string[]; readonly default: string };
  /** closed sets the CSS reads; key order is attribute order in the DOM */
  readonly axes: Readonly<Record<string, Axis>>;
  /** what a component with nothing to host does */
  readonly content: { readonly empty: "suppress" | "render" };
}

type AxisInput<A> = A extends BooleanAxis ? boolean : A extends EnumAxis ? A["values"][number] : never;

/** The props a renderer accepts, derived from the table — no renderer lists them. */
export type InputOf<R extends Recipe> = {
  element?: R["element"]["values"][number];
  class?: string;
} & { [K in keyof R["axes"]]?: AxisInput<R["axes"][K]> };

export interface Context {
  /** whether the renderer has content to host; the renderer detects it, the recipe decides */
  hasContent: boolean;
}

export interface Resolution {
  mode: "render" | "suppress" | "error";
  errorMessage: string;
  tag: string;
  className: string;
  /** in write order — renderers keep it, so every renderer emits the same markup */
  attrs: Record<string, string>;
  /** props the recipe does not know, for the renderer to pass through (id, style, aria-*) */
  rest: Record<string, unknown>;
}

const kebab = (s: string) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

const booleanOf = (v: unknown): boolean | null =>
  v === true || v === "" || v === "true" ? true : v === false || v === "false" ? false : null;

export function resolve<R extends Recipe>(recipe: R, props: Record<string, unknown>, ctx: Context): Resolution {
  const known = new Set(["element", "class", ...Object.keys(recipe.axes)]);
  const rest: Record<string, unknown> = {};
  for (const key of Object.keys(props)) if (!known.has(key)) rest[key] = props[key];

  const elementProp = typeof props.element === "string" ? props.element.toLowerCase() : recipe.element.default;
  const tag = recipe.element.values.includes(elementProp) ? elementProp : recipe.element.default;

  const extra = typeof props.class === "string" ? props.class.trim() : "";
  const className = extra ? `${recipe.class} ${extra}` : recipe.class;

  let mode: Resolution["mode"] = ctx.hasContent || recipe.content.empty === "render" ? "render" : "suppress";
  let errorMessage = "";
  const attrs: Record<string, string> = {};

  for (const [name, axis] of Object.entries(recipe.axes)) {
    const raw = props[name];
    if ("type" in axis) {
      // A boolean arrives as a boolean (Astro, React), as "true"/"false" (a CMS, a string
      // template) or as "" (a bare attribute in a Vue template — presence means true, as in
      // HTML). Anything else is a value outside the set (ADR-0019).
      const flag = raw == null ? axis.default : booleanOf(raw);
      if (flag === null) {
        if (mode === "render") {
          mode = "error";
          errorMessage = `invalid ${name} "${raw}" — expected true | false`;
        }
        attrs[`data-${kebab(name)}`] = axis.default ? "true" : "false";
        continue;
      }
      attrs[`data-${kebab(name)}`] = flag ? "true" : "false";
      continue;
    }
    const value = raw == null ? axis.default : String(raw).toLowerCase();
    if (mode === "render" && !axis.values.includes(value)) {
      mode = "error";
      errorMessage = `invalid ${name} "${raw}" — expected ${axis.values.join(" | ")}`;
    }
    attrs[`data-${kebab(name)}`] = value;
  }

  return { mode, errorMessage, tag, className, attrs, rest };
}
