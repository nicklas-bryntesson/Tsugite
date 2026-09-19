// The recipe interpreter (ADR-0018). A recipe is a table in recipes/<name>.recipe.ts:
// the promise, the element, the host attributes per element, the parts, the closed axes
// in DOM order, the derived flags, the absent cells, what an empty component does. This
// is the one function that reads those tables — for every component, in every renderer.
// It resolves props to a tag, a class, the attributes in write order and a mode, and it
// is the only place the error rule (ADR-0019) is implemented.

export interface EnumAxis {
  /** the closed set; or, when the set depends on another axis's value, `valuesBy` */
  readonly values?: readonly string[];
  /** one lookup: the value set for this axis, by another axis's value (size by variant) */
  readonly valuesBy?: { readonly axis: string; readonly values: Readonly<Record<string, readonly string[]>> };
  /** the default, or a named hole the renderer fills through `ctx.defaults` when the
   *  default needs a formula (a heading's size follows its element) */
  readonly default: string | { readonly hole: true };
  readonly when?: When;
  /** a composition's axis whose values are another recipe's INPUT (Teaser's frame is Card
   *  input). The CSS never reads it, so no attribute is written; the renderer hands
   *  `resolution.maps[name]` to the part's component (ADR-0017 decision 6). */
  readonly maps?: { readonly to: string; readonly values: Readonly<Record<string, unknown>> };
}

export interface BooleanAxis {
  readonly type: "boolean";
  readonly default: boolean;
  readonly when?: When;
}

export type Axis = EnumAxis | BooleanAxis;

/** One lookup, one level: the axis exists when another field has this value. Never `and`. */
export type When = { readonly element: string } | { readonly part: string };

/**
 * A host attribute: an open value the element carries. `string` is written when
 * non-empty; `boolean` is written bare when true; `{ default }` is always written;
 * `implies` maps one value to further attributes (target "_blank" implies rel).
 */
export type HostAttr =
  | "string"
  | "boolean"
  | { readonly default: string }
  | { readonly type: "string"; readonly implies: Readonly<Record<string, Readonly<Record<string, string>>>> };

/** A named child (ADR-0013). `slot`: the renderer hosts it and reports whether it is
 *  filled. `name`: an open string written to an attribute (an icon's sprite id). `text`:
 *  a string the renderer writes inside a part element. */
export type Part = (
  | { readonly kind: "slot" }
  | { readonly kind: "name"; readonly attr: string }
  | { readonly kind: "text"; readonly default?: string }
) & {
  /** the recipe this part is rendered through, and the fixed input the composition gives it.
   *  Data for the renderer; the interpreter does not act on it. */
  readonly uses?: string;
  readonly with?: Readonly<Record<string, unknown>>;
};

/** A value the CSS or the accessibility tree reads that comes from content or shape, not
 *  props: a boolean flag (icon-only), a closed string (a run is inline or block by its
 *  element), or an attribute that is present or not (aria-labelledby on an aside only —
 *  the formula returns null to write nothing). The recipe names it and what it depends
 *  on; the renderer supplies the formula through `ctx.derive` (the hole). */
export interface Derived {
  readonly attr: string;
  readonly from: readonly string[];
}

/** A cell the CSS has no answer for. Matched against the element, resolved axes, derived
 *  values, parts and host attributes: a value means equality, `null` means absent, and
 *  `true` on a part or host attribute means present. The system declares these; a project
 *  closes cells that render but are unwanted (ADR-0018 §5). */
export interface Absent {
  readonly cells: Readonly<Record<string, unknown>>;
  readonly message: string;
}

export interface Recipe {
  readonly name: string;
  /** one sentence: what the component does; the new-component test compares against it */
  readonly promise: string;
  /** what it will not be asked to do — nouns, not rules */
  readonly refuses?: readonly string[];
  /** the root class the CSS gates on */
  readonly class: string;
  /** the permitted tags; an invalid one falls back to the default (ADR-0019), unless required.
   *  The default may be a hole when the element follows the content (Quote: words alone are
   *  an aside, words with a source or a portrait a figure); the formula sees the parts. */
  readonly element: { readonly values: readonly string[]; readonly default?: string | { readonly hole: true }; readonly required?: true };
  /** open-valued attributes per element; "*" for every element */
  readonly host?: Readonly<Record<string, Readonly<Record<string, HostAttr>>>>;
  readonly parts?: Readonly<Record<string, Part>>;
  /** closed sets the CSS reads; key order is attribute order in the DOM */
  readonly axes: Readonly<Record<string, Axis>>;
  readonly derived?: Readonly<Record<string, Derived>>;
  readonly absent?: readonly Absent[];
  /** what a component with nothing to host does; `unless` names parts or host attributes
   *  whose presence counts as content */
  readonly content: { readonly empty: "suppress" | "render"; readonly unless?: readonly string[] };
}

type EnumValues<A> = A extends { values: readonly (infer V)[] }
  ? V
  : A extends { valuesBy: { values: Readonly<Record<string, readonly (infer W)[]>> } }
    ? W
    : never;
type AxisInput<A> = A extends BooleanAxis ? boolean : A extends EnumAxis ? EnumValues<A> : never;
type HostInput<H> = H extends "boolean" ? boolean : string;
type PartInput<P> = P extends { kind: "slot" } ? never : string;
type HostAttrsOf<R extends Recipe> = R["host"] extends Readonly<Record<string, Readonly<Record<string, HostAttr>>>>
  ? { [E in keyof R["host"]]: R["host"][E] }[keyof R["host"]]
  : {};
type UnionToIntersection<U> = (U extends unknown ? (u: U) => void : never) extends (i: infer I) => void ? I : never;
type HostInputs<R extends Recipe> = UnionToIntersection<HostAttrsOf<R>> extends infer H
  ? { [K in keyof H]?: HostInput<H[K]> }
  : {};
type PartInputs<R extends Recipe> = R["parts"] extends Readonly<Record<string, Part>>
  ? { [K in keyof R["parts"] as PartInput<R["parts"][K]> extends never ? never : K]?: string }
  : {};

/** The props a renderer accepts, derived from the table — no renderer lists them. */
export type InputOf<R extends Recipe> = {
  element?: R["element"]["values"][number];
  class?: string;
} & { [K in keyof R["axes"]]?: AxisInput<R["axes"][K]> } & HostInputs<R> & PartInputs<R>;

/** What the renderer knows about content and parts, and the formulas for derived flags. */
export interface Context {
  /** whether the default slot has content (a component without parts) */
  hasContent?: boolean;
  /** per slot part: whether the renderer has content for it */
  slots?: Readonly<Record<string, boolean>>;
  /** the handwritten formulas for the recipe's derived values, by name */
  derive?: Readonly<Record<string, (view: View) => boolean | string | null>>;
  /** the handwritten formulas for axis defaults declared as holes, by axis name */
  defaults?: Readonly<Record<string, (view: View) => string>>;
}

/** What a derived formula, a default hole and an absent cell may look at. For an element
 *  hole `tag` is still empty. */
export interface View {
  readonly tag: string;
  readonly axes: Readonly<Record<string, string | boolean>>;
  /** slot: filled or not; name/text: the string, or null */
  readonly parts: Readonly<Record<string, string | boolean | null>>;
  /** host attribute values as given, or null */
  readonly host: Readonly<Record<string, string | boolean | null>>;
}

export interface Resolution {
  mode: "render" | "suppress" | "error";
  errorMessage: string;
  tag: string;
  className: string;
  /** in write order — renderers keep it, so every renderer emits the same markup.
   *  `true` is a boolean attribute (disabled), written in each host's idiom. */
  attrs: Record<string, string | true>;
  /** the parts as resolved: slot presence, name and text values */
  parts: Record<string, string | boolean | null>;
  /** for each mapped axis, the other recipe's input its value stands for (null = no part) */
  maps: Record<string, unknown>;
  /** props the recipe does not know, for the renderer to pass through (id, style, aria-*) */
  rest: Record<string, unknown>;
}

const kebab = (s: string) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

const booleanOf = (v: unknown): boolean | null =>
  v === true || v === "" || v === "true" ? true : v === false || v === "false" ? false : null;

const stringOf = (v: unknown): string | null => (typeof v === "string" && v.trim() ? v.trim() : null);

export function resolve<R extends Recipe>(recipe: R, props: Record<string, unknown>, ctx: Context = {}): Resolution {
  let mode: Resolution["mode"] = "render";
  let errorMessage = "";
  const fail = (message: string) => {
    if (mode === "render") {
      mode = "error";
      errorMessage = message;
    }
  };

  // ── parts, first: the element may follow them ──────────────────────────────
  const parts: Record<string, string | boolean | null> = {};
  for (const [name, part] of Object.entries(recipe.parts ?? {})) {
    if (part.kind === "slot") parts[name] = ctx.slots?.[name] ?? ctx.hasContent ?? false;
    else if (part.kind === "name") parts[name] = stringOf(props[name]);
    // a text part keeps its spacing: " about Widgets" begins with the space that separates it
    else parts[name] = typeof props[name] === "string" && (props[name] as string).trim() ? (props[name] as string) : (part.default ?? null);
  }

  // ── element ────────────────────────────────────────────────────────────────
  const elementProp = typeof props.element === "string" ? props.element.toLowerCase() : null;
  let tag: string;
  if (elementProp && recipe.element.values.includes(elementProp)) tag = elementProp;
  else if (recipe.element.required) {
    fail(`element is required — expected ${recipe.element.values.join(" | ")}`);
    tag = recipe.element.values[0];
  } else if (typeof recipe.element.default === "object") {
    const formula = ctx.defaults?.element;
    if (!formula) throw new Error(`${recipe.name}: no formula for the element — the renderer must supply ctx.defaults.element`);
    tag = formula({ tag: "", axes: {}, parts, host: {} });
  } else tag = recipe.element.default ?? recipe.element.values[0];

  // ── what the recipe knows, so the rest can be separated ────────────────────
  const hostAll: Record<string, HostAttr> = { ...(recipe.host?.[tag] ?? {}), ...(recipe.host?.["*"] ?? {}) };
  const hostElsewhere = new Set<string>();
  for (const [el, attrs] of Object.entries(recipe.host ?? {})) if (el !== "*" && el !== tag) for (const k of Object.keys(attrs)) hostElsewhere.add(k);
  const known = new Set(["element", "class", ...Object.keys(hostAll), ...hostElsewhere, ...Object.keys(recipe.parts ?? {}), ...Object.keys(recipe.axes)]);
  const rest: Record<string, unknown> = {};
  for (const key of Object.keys(props)) if (!known.has(key) && props[key] !== undefined) rest[key] = props[key];

  const extra = typeof props.class === "string" ? props.class.trim() : "";
  const className = extra ? `${recipe.class} ${extra}` : recipe.class;

  const attrs: Record<string, string | true> = {};
  const host: Record<string, string | boolean | null> = {};
  const axes: Record<string, string | boolean> = {};
  const maps: Record<string, unknown> = {};

  // ── host attributes: this element's, then what belongs to another element ──
  for (const [name, spec] of Object.entries(hostAll)) {
    const raw = props[name];
    if (spec === "boolean") {
      const flag = raw == null ? false : booleanOf(raw);
      if (flag === null) fail(`invalid ${name} "${raw}" — expected true | false`);
      host[name] = flag ?? false;
      if (flag) attrs[name] = true;
      continue;
    }
    const value = stringOf(raw);
    if (typeof spec === "object" && "default" in spec) {
      const written = value ?? spec.default;
      host[name] = written;
      attrs[name] = written;
      continue;
    }
    host[name] = value;
    if (value !== null) {
      attrs[name] = value;
      if (typeof spec === "object" && "implies" in spec) for (const [k, v] of Object.entries(spec.implies[value] ?? {})) attrs[k] = v;
    }
  }
  for (const name of hostElsewhere) if (!(name in hostAll) && props[name] !== undefined) fail(`${name} is not an attribute of <${tag}>`);

  // ── a name part writes its attribute here, after the host attributes, before the axes ──
  for (const [name, part] of Object.entries(recipe.parts ?? {})) if (part.kind === "name" && typeof parts[name] === "string") attrs[part.attr] = parts[name] as string;

  // ── axes, in order; a gated axis is written only when its gate holds ───────
  const holds = (when: When | undefined) => !when || ("element" in when ? when.element === tag : !!parts[when.part]);
  for (const [name, axis] of Object.entries(recipe.axes)) {
    const raw = props[name];
    if (!holds(axis.when)) {
      if (raw !== undefined) fail(`${name} does not exist on ${"element" in axis.when! ? `<${tag}>` : `a ${recipe.name} without ${(axis.when as { part: string }).part}`}`);
      continue;
    }
    const attr = `data-${kebab(name)}`;
    if ("type" in axis) {
      // A boolean arrives as a boolean (Astro, React), as "true"/"false" (a CMS, a string
      // template) or as "" (a bare attribute in a Vue template — presence means true, as in
      // HTML). Anything else is a value outside the set (ADR-0019).
      const flag = raw == null ? axis.default : booleanOf(raw);
      if (flag === null) fail(`invalid ${name} "${raw}" — expected true | false`);
      axes[name] = flag ?? axis.default;
      attrs[attr] = axes[name] ? "true" : "false";
      continue;
    }
    const values = axis.valuesBy ? (axis.valuesBy.values[String(axes[axis.valuesBy.axis])] ?? []) : (axis.values ?? []);
    let fallback: string;
    if (typeof axis.default === "string") fallback = axis.default;
    else {
      const formula = ctx.defaults?.[name];
      if (!formula) throw new Error(`${recipe.name}: no formula for the default of "${name}" — the renderer must supply ctx.defaults.${name}`);
      fallback = formula({ tag, axes, parts, host });
    }
    const value = raw == null ? fallback : String(raw).toLowerCase();
    if (!values.includes(value)) {
      const scope = axis.valuesBy ? ` for ${axis.valuesBy.axis} "${axes[axis.valuesBy.axis]}"` : "";
      fail(`invalid ${name} "${raw}"${scope} — expected ${values.join(" | ")}`);
    }
    axes[name] = value;
    if (axis.maps) maps[name] = values.includes(value) ? (axis.maps.values[value] ?? null) : null;
    else attrs[attr] = value;
  }

  // ── derived flags: named in the table, computed by the hole ────────────────
  const view: View = { tag, axes, parts, host };
  const derived: Record<string, boolean | string | null> = {};
  for (const [name, spec] of Object.entries(recipe.derived ?? {})) {
    const formula = ctx.derive?.[name];
    if (!formula) throw new Error(`${recipe.name}: no formula for derived value "${name}" — the renderer must supply ctx.derive.${name}`);
    const value = formula(view);
    derived[name] = value;
    if (value === null) continue; // present or not: nothing to write
    attrs[spec.attr] = typeof value === "string" ? value : value ? "true" : "false";
  }

  // ── content: nothing to host, nothing to announce → suppress ───────────────
  const filled = Object.entries(parts).some(([, v]) => v === true) || (ctx.hasContent ?? false);
  const unless = (recipe.content.unless ?? []).some((k) => (k in parts ? parts[k] !== null && parts[k] !== false : host[k] != null && host[k] !== false));
  if (!filled && !unless && recipe.content.empty === "suppress") mode = "suppress";

  // ── absent cells ───────────────────────────────────────────────────────────
  if (mode === "render") {
    const cellView: Record<string, unknown> = { element: tag, ...host, ...parts, ...axes, ...derived };
    const present = (k: string) => cellView[k] != null && cellView[k] !== false;
    const matches = (k: string, v: unknown) =>
      v === null ? !present(k) : v === true && typeof cellView[k] !== "boolean" ? present(k) : cellView[k] === v;
    for (const { cells, message } of recipe.absent ?? []) {
      const hit = Object.entries(cells).every(([k, v]) => matches(k, v));
      if (hit) {
        fail(message);
        break;
      }
    }
  }

  return { mode, errorMessage, tag, className, attrs, parts, maps, rest };
}
