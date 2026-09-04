// THE SPACING SCALE (ADR-0001, ADR-0011)
//
// Nine steps, one value per viewport tier — explicit stops, no fluid math
// (ADR-0001). WIDE equals DESKTOP: spacing stops growing at 90rem.
// The factory emits both the rem constants (--SIZE-MD-DESKTOP) and their px
// twins (--SIZE-MD-DESKTOP-PX, derived at 16px/rem), the semantic ramp
// (--size-md, gated per tier and multiplied by --SPACE-SCALE) and its px
// twin (--size-md-px). Humans edit here; base.generated.css is the output.

/** The multiplier every semantic step is scaled by. Consumers may override. */
export const spaceScale = "1";

/** rem per tier. Order is the scale order — emitted top to bottom. */
export const spaceSteps = {
  xs:    { floor: "0.125rem",  mobile: "0.1875rem", desktop: "0.25rem", wide: "0.25rem" },
  sm:    { floor: "0.25rem",   mobile: "0.375rem",  desktop: "0.5rem",  wide: "0.5rem"  },
  md:    { floor: "0.625rem",  mobile: "0.75rem",   desktop: "1rem",    wide: "1rem"    },
  lg:    { floor: "1rem",      mobile: "1.125rem",  desktop: "1.5rem",  wide: "1.5rem"  },
  xl:    { floor: "1.25rem",   mobile: "1.5rem",    desktop: "2rem",    wide: "2rem"    },
  "2xl": { floor: "1.5rem",    mobile: "1.875rem",  desktop: "2.5rem",  wide: "2.5rem"  },
  "3xl": { floor: "1.75rem",   mobile: "2.25rem",   desktop: "3rem",    wide: "3rem"    },
  "4xl": { floor: "2rem",      mobile: "2.625rem",  desktop: "3.5rem",  wide: "3.5rem"  },
  "5xl": { floor: "2.25rem",   mobile: "3rem",      desktop: "4rem",    wide: "4rem"    },
};

/** The RAW constant name for a step at a tier: --SIZE-2XL-DESKTOP. */
export const sizeConstantName = (step, tier) => `--SIZE-${step.toUpperCase()}-${tier.toUpperCase()}`;

/** The semantic name: --size-2xl. */
export const sizeTokenName = (step) => `--size-${step}`;
