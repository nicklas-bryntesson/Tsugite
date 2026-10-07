// A state map as data: the states a component has, which pairs of them can meet, and the
// triples worth seeing. StateMatrix.astro draws it for any component, and a test holds it
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

export interface StateMap {
  /** the props every cell starts from */
  base: Record<string, unknown>;
  states: State[];
  /** every unordered pair, keyed "a+b" in the order of `states` */
  pairs: Record<string, { reach: Reach; note?: string }>;
  triples: Array<{ keys: [string, string, string]; note: string }>;
}

export const pairKey = (a: string, b: string, order: string[]) =>
  order.indexOf(a) < order.indexOf(b) ? `${a}+${b}` : `${b}+${a}`;

/** One cell's props: the base, then each state's props in order; data-test-state values
 *  join (the rig reads them with ~=), a null removes a prop. */
export function propsFor(map: StateMap, keys: string[]): Record<string, unknown> {
  const out: Record<string, unknown> = { ...map.base };
  const testStates: string[] = [];
  for (const key of keys) {
    const state = map.states.find((s) => s.key === key)!;
    for (const [name, value] of Object.entries(state.props)) {
      if (name === "data-test-state") testStates.push(String(value));
      else if (value === null) delete out[name];
      else out[name] = value;
    }
  }
  if (testStates.length) out["data-test-state"] = testStates.join(" ");
  return out;
}
