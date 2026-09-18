// Teaser — the table (ADR-0018). A composition: it owns arrangement and nothing its parts
// own. The frame is Card input, the media is a Picture, the action is a Button; the table
// says which and with what, and the renderer hands each part to its component
// (ADR-0017 decision 6). lib/teaser.ts holds the one derived flag and the content plan.
import type { Recipe } from "../lib/recipe";

export const teaser = {
  name: "Teaser",
  promise: "Transports the reader to one destination: the whole card is the link, or a button is.",
  refuses: ["forms", "carts", "several destinations", "colour rules of its own — a voice is a Surface it hosts"],
  class: "Teaser",
  element: { values: ["article", "div", "li", "section"], default: "article" },
  parts: {
    /** the image; presence is what the renderer reports */
    media: { kind: "slot", uses: "Picture", with: { preset: "teaser" } },
    heading: { kind: "text", uses: "Heading", with: { element: "h2", size: "4" } },
    excerpt: { kind: "text", uses: "Prose", with: { variant: "basic", size: "sm" } },
    /** the one destination; a text the parts receive, never an attribute of the root */
    href: { kind: "text" },
    /** the default slot: whatever else the teaser carries */
    body: { kind: "slot" },
    buttonLabel: { kind: "text", default: "Read more" },
    /** the sr-only connector between the label and the heading — copy, so an input with a default */
    buttonContext: { kind: "text", default: " about " },
    action: { kind: "slot", uses: "Button", with: { element: "a", size: "sm", growInline: true } },
  },
  axes: {
    frame: {
      values: ["bordered", "elevated", "bare"],
      default: "bordered",
      maps: {
        to: "Card",
        values: {
          bordered: { element: "div", padding: "none", border: true, elevation: "none" },
          elevated: { element: "div", padding: "none", border: false, elevation: "sm" },
          bare: null,
        },
      },
    },
    /** true: a button carries the link and the heading is plain; false: the card is the link */
    button: { type: "boolean", default: false },
  },
  derived: {
    hasMedia: { attr: "data-media", from: ["media"] },
  },
  absent: [{ cells: { button: true, href: null }, message: 'button="true" requires href' }],
  content: { empty: "render" },
} as const satisfies Recipe;
