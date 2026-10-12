// Button's bench cases, in three families. The full product of its axes is near four
// thousand buttons; it falls apart into two families that never touch — colour (emphasis,
// intent, state) and geometry (size, pill, grow, icon position) — and the cut holds only
// while they stay apart. So:
//
//   colour    every emphasis × intent × state cell × content × door, at the default geometry:
//             the family axe reads, since contrast is a colour property
//   geometry  every size × pill × grow × icon position × content × door, at rest, primary
//   pairwise  a pairwise cover of the full product (pairwise.ts): every two axis values
//             that can meet, meet once. The suite holds each of its buttons to the colour
//             case with its colour and the geometry case with its geometry — a selector
//             that couples the families shows up as a difference
//
// Every case is named "<family>/<door>/<content>/<states>/<colour>/<geometry>", so the
// suite finds a pairwise button's two references by its name. The axis values come from
// the table, so a new value reaches all three families without an edit here.
import { button } from "../../recipes/button.recipe";
import { actionStates, linkStates } from "./button.states";
import { excludedBy, propsFor, type Content, type StateMap } from "./types";
import { pairwise, type Row } from "./pairwise";

export type Family = "colour" | "geometry" | "pairwise";

export interface ButtonCase {
  family: Family;
  name: string;
  door: "action" | "link";
  label?: string;
  props: Record<string, unknown>;
}

const doors = [
  { door: "action", map: actionStates },
  { door: "link", map: linkStates },
] as const;

// Tertiary is refused by the table (closed until designed) and renders a DevError.
const emphases = button.axes.emphasis.values.filter((e) => e !== "tertiary");
const intents = button.axes.intent.values;
const sizes = button.axes.size.values;
const positions = button.axes.iconPosition.values;
const booleans = ["off", "on"] as const;

const cellsOf = (map: StateMap): string[][] => [
  [],
  ...map.states.map((s) => [s.key]),
  ...Object.entries(map.pairs)
    .filter(([, pair]) => pair.reach !== "no")
    .map(([key]) => key.split("+")),
  ...map.triples.map((t) => [...t.keys]),
];

const hasIcon = (content: Content) => "icon" in content.props;
const iconOnly = (content: Content) => hasIcon(content) && content.props.label === null;

// One row: the door, its content and state cell, and a value for every axis. "-" is an
// axis that does not apply — intent on a link, icon position without an icon.
const rowsFor = (door: string, map: StateMap, content: Content, cells: string[][], colour: Row[], geometry: Row[]) =>
  cells
    .filter((keys) => excludedBy(content, keys) === null)
    .flatMap((keys) =>
      colour.flatMap((c) =>
        geometry.map((g) => ({ door, content: content.key, states: keys.length ? keys.join("+") : map.rest.key, ...c, ...g })),
      ),
    );

const colourRows = (door: string): Row[] =>
  emphases.flatMap((emphasis) =>
    (door === "action" ? intents : ["-"]).map((intent) => ({ emphasis, intent })),
  );

const geometryRows = (content: Content): Row[] =>
  sizes.flatMap((size) =>
    booleans.flatMap((pill) =>
      (iconOnly(content) ? ["off"] : booleans).flatMap((grow) =>
        (hasIcon(content) ? positions : ["-"]).map((position) => ({ size, pill, grow, position })),
      ),
    ),
  );

const defaults = (content: Content): Row => ({
  size: button.axes.size.default,
  pill: "off",
  grow: "off",
  position: hasIcon(content) ? button.axes.iconPosition.default : "-",
});

const colourKey = (r: Row) => (r.intent === "-" ? r.emphasis : `${r.emphasis}.${r.intent}`);
const geometryKey = (r: Row) =>
  [r.size, r.pill === "on" && "pill", r.grow === "on" && "grow", r.position !== "-" && r.position].filter(Boolean).join(".");

const toCase = (family: Family, row: Row): ButtonCase => {
  const { door, map } = doors.find((d) => d.door === row.door)!;
  const content = map.contents.find((c) => c.key === row.content)!;
  const keys = row.states === map.rest.key ? [] : row.states.split("+");
  const { element, label, ...stateProps } = propsFor(map, keys, content);
  const axisProps: Record<string, unknown> = { emphasis: row.emphasis, size: row.size };
  if (row.intent !== "-") axisProps.intent = row.intent;
  if (row.pill === "on") axisProps.pill = true;
  if (row.grow === "on") axisProps.growInline = true;
  if (row.position !== "-") axisProps["icon-position"] = row.position;
  return {
    family,
    name: [family, door, row.content, row.states, colourKey(row), geometryKey(row)].join("/"),
    door,
    label: (label as string | null) ?? undefined,
    props: { ...(element === "a" ? { href: "#" } : {}), ...axisProps, ...stateProps },
  };
};

const byDoor = doors.flatMap(({ door, map }) => map.contents.map((content) => ({ door, map, content })));

export const colourCases: ButtonCase[] = byDoor.flatMap(({ door, map, content }) =>
  rowsFor(door, map, content, cellsOf(map), colourRows(door), [defaults(content)]).map((r) => toCase("colour", r)),
);

export const geometryCases: ButtonCase[] = byDoor.flatMap(({ door, map, content }) =>
  rowsFor(door, map, content, [[]], [{ emphasis: emphases[0], intent: door === "action" ? intents[0] : "-" }], geometryRows(content)).map(
    (r) => toCase("geometry", r),
  ),
);

/** The full product, constraints applied: what the pairwise family is picked from. */
export const fullProduct: Row[] = byDoor.flatMap(({ door, map, content }) =>
  rowsFor(door, map, content, cellsOf(map), colourRows(door), geometryRows(content)),
);

/** The cover itself, as rows. */
export const pairwiseRows: Row[] = pairwise(fullProduct);

export const pairwiseCases: ButtonCase[] = pairwiseRows.map((r) => toCase("pairwise", r));

export const buttonCases: ButtonCase[] = [...colourCases, ...geometryCases, ...pairwiseCases];
