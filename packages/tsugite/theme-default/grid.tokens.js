// THE GRIDS (ADR-0011)
//
// Three grid recipes consumed by styles/utils/grids/*.css and CoverComposition:
//   container — a centered single content column between two fluid gutters
//   layout    — a 1/4/8/12-column responsive grid
//   breakout  — 14 tracks: 12 centered columns with a fluid first and last
// Column count and gap come from one table per step; the templates are
// derived by the factory so the three recipes can never disagree.
//
// NOTE — the grid has its OWN ladder. Its steps (base/mobile/tablet/desktop)
// and boundaries (40 / 48 / 80rem) predate ADR-0001 and do not coincide with
// the viewport tiers (21.25 / 48.75 / 90rem). This file ports the ladder
// faithfully; aligning it is a threshold decision parked in tasks/parking-lot.md.

export const GRID_STEPS = ["base", "mobile", "tablet", "desktop"];

export const GRID_MEDIA = {
  base: "(max-width: 39.9375rem)",
  mobile: "(min-width: 40rem) and (max-width: 47.9375rem)",
  tablet: "(min-width: 48rem) and (max-width: 79.9375rem)",
  desktop: "(min-width: 80rem)",
};

/** RAW per step: the gap between columns and the column count. */
export const gridSteps = {
  base:    { gap: "0",      columns: "1"  },
  mobile:  { gap: "0.5rem", columns: "4"  },
  tablet:  { gap: "1rem",   columns: "8"  },
  desktop: { gap: "2rem",   columns: "12" },
};

export const gridGapConstantName = (step) => `--GRID-GAP-${step.toUpperCase()}`;
export const gridColumnsConstantName = (step) => `--GRID-COLUMNS-${step.toUpperCase()}`;
