// ItemGrid — the table (ADR-0018). A region that distributes equal items over as many
// columns as its own width allows and decides the last, short row (ADR-0028). It owns the
// distribution and nothing the items own: an item is laid out by its own container
// queries in the width it is given. lib/itemgrid.ts holds the one derived value.
//
// ItemGridItem is ItemGrid's part, given its own table because a renderer cannot wrap
// another component's children for it: the cell an item stands in. Its element follows the
// grid's — li under ul or ol, div under div — and its only job is to hand the item the
// whole cell.
import type { Recipe } from "../lib/recipe";

export const itemGrid = {
  name: "ItemGrid",
  promise: "A list of equal items whose last row is decided, not left over.",
  refuses: [
    "items of unequal weight — a featured item is a layout, not a remainder",
    "reordering — the DOM order is the reading order, only the spans change",
    "styling its items — an item reshapes on the width it is given",
  ],
  class: "ItemGrid",
  element: { values: ["ul", "ol", "div"], default: "ul" },
  axes: {
    /** what the leftovers of the last row do in the two- and three-column states */
    remainder: { values: ["balance", "split", "fill", "inset", "center", "start"], default: "balance" },
  },
  derived: {
    /** a list styled without markers loses its list role in WebKit; the grid writes it back */
    listRole: { attr: "role", from: ["element"] },
  },
  content: { empty: "suppress" },
} as const satisfies Recipe;

export const itemGridItem = {
  name: "ItemGridItem",
  promise: "The cell one item of an ItemGrid stands in.",
  refuses: ["a grid of its own — it is a part of ItemGrid", "styling the item it holds"],
  class: "item",
  element: { values: ["li", "div"], default: "li" },
  axes: {},
  content: { empty: "suppress" },
} as const satisfies Recipe;
