// ItemGrid — the hole in the table (ADR-0018): the list role. ItemGrid.css takes the
// markers off its lists, and WebKit then drops the list role from the accessibility tree;
// a ul or ol says role="list" so it stays a list. A div has no role to keep.
import type { View } from "./recipe";

export const itemGridDerive = {
  listRole: ({ tag }: View) => (tag === "div" ? null : "list"),
};
