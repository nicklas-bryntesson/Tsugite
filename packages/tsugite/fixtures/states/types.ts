// A state map as data: what a component can contain, the states it has, which pairs of
// them can meet, and the triples worth seeing. Content is not a state — it runs through
// every state — so the matrix is drawn once per content. StateMatrix.astro draws it for any component, and a test holds it
// complete — every pair answered — so no combination stays hidden by being forgotten.

/** How a pair of states can meet, measured or reasoned (tasks/plan-fields.md). */
export type Reach =
  /** both can hold at once */
  | "yes"
  /** never at once — the cell is drawn empty, with the reason */
  | "no"
  /** only through an attribute an author sets, not through the browser's own state */
  | "aria"
  /** not measured yet — drawn, and marked as a question */
  | "unknown";

export interface State {
  key: string;
  label: string;
  /** the props that put the component in this state; data-test-state values are joined */
  props: Record<string, unknown>;
}

/** What the component holds: a field empty, with a placeholder, with a value; a button
 *  with text, text and an icon, an icon alone. The same matrix is drawn for each. */
export interface Content {
  key: string;
  label: string;
  /** the props that give the component this content; applied after the states */
  props: Record<string, unknown>;
  /** states this content cannot meet at all, with the reason (autofill needs a value) */
  excludes?: Record<string, string>;
}

export interface StateMap {
  /** the props every cell starts from */
  base: Record<string, unknown>;
  contents: Content[];
  /** the state with no interaction: the first row and column, never in a pair */
  rest: { key: string; label: string };
  states: State[];
  /** every unordered pair, keyed "a+b" in the order of `states` */
  pairs: Record<string, { reach: Reach; note?: string }>;
  triples: Array<{ keys: [string, string, string]; note: string }>;
}

export const pairKey = (a: string, b: string, order: string[]) =>
  order.indexOf(a) < order.indexOf(b) ? `${a}+${b}` : `${b}+${a}`;

/** One cell's props: the base, each state's props in order, then the content's;
 *  data-test-state values join (the rig reads them with ~=), a null removes a prop. */
export function propsFor(map: StateMap, keys: string[], content: Content): Record<string, unknown> {
  const out: Record<string, unknown> = { ...map.base };
  const testStates: string[] = [];
  const apply = (props: Record<string, unknown>) => {
    for (const [name, value] of Object.entries(props)) {
      if (name === "data-test-state") testStates.push(String(value));
      else if (value === null) delete out[name];
      else out[name] = value;
    }
  };
  for (const key of keys) apply(map.states.find((s) => s.key === key)!.props);
  apply(content.props);
  if (testStates.length) out["data-test-state"] = testStates.join(" ");
  return out;
}

/** Why a set of states cannot be drawn with this content, or null when it can. */
export const excludedBy = (content: Content, keys: string[]): string | null =>
  keys.map((k) => content.excludes?.[k]).find((reason) => reason) ?? null;
