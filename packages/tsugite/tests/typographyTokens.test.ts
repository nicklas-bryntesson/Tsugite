// Typography pipeline guards (ADR-0003 extended to type): completeness
// is validated in JS — a missing tier or bundle metric is a build error,
// never a silent metric bug — the committed artifact must match the
// factory, and the token tables cross-validate against the component
// family contract so the voices the family SPEAKS and the voices the
// theme DEFINES can never drift apart.
import { readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";
import { validateTypography, generateTypographyStylesheet } from "../engine/collector.js";
import { TIERS, typeVoices, typeSizes, sizeTokenName } from "../theme-default/typography.tokens.js";
import { FAMILY, VOICE_SIZES } from "../lib/typographyFamily.ts";

describe("the typography tables", () => {
  it("every voice and every ramp is complete (the refusal rule)", () => {
    expect(() => validateTypography()).not.toThrow();
  });

  it("the committed artifact matches the factory (freshness)", () => {
    const artifact = readFileSync(
      new URL("../styles/tokens/typography/typography.generated.css", import.meta.url),
      "utf8",
    );
    expect(artifact).toBe(generateTypographyStylesheet());
  });

  it("a tier-mapped metric emits per tier (and in the bench overrides), never in :root", () => {
    const tables = {
      families: { "--SYNTH": { stack: "'Synth', sans-serif", metrics: { ascent: 0.9, capHeight: 0.7, descent: 0.2 } } },
      weights: { "--SYNTH-400": "400" },
      sizes: { probe: { floor: "1rem", mobile: "1rem", desktop: "1rem", wide: "1rem" } },
      voices: {
        probe: {
          family: "--SYNTH",
          weights: { default: "--SYNTH-400" },
          lineHeight: "1.4",
          letterSpacing: { floor: "0", mobile: "-0.005em", desktop: "-0.01em", wide: "-0.01em" },
          featureSettings: "normal",
          baselineOffset: "0",
        },
      },
    };
    const css = generateTypographyStylesheet(tables);
    // the scalar stays in :root, the tiered metric never appears there
    const root = css.slice(0, css.indexOf("@media"));
    expect(root).toContain("--lineHeight-probe: 1.4;");
    expect(root).not.toContain("--letterSpacing-probe");
    // one emission per tier block + one per bench override (floor/mobile/desktop)
    expect(css.match(/--letterSpacing-probe: -0\.01em;/g)?.length).toBe(3); // desktop + wide + bench desktop
    expect(css.match(/--letterSpacing-probe: 0;/g)?.length).toBe(2); // floor + bench floor
    expect(css.match(/--letterSpacing-probe: -0\.005em;/g)?.length).toBe(2); // mobile + bench mobile
  });

  it("a partial tier map is refused (the refusal rule)", () => {
    const tables = {
      families: { "--SYNTH": { stack: "x", metrics: { ascent: 0.9, capHeight: 0.7, descent: 0.2 } } },
      weights: { "--SYNTH-400": "400" },
      sizes: {},
      voices: {
        probe: {
          family: "--SYNTH",
          weights: { default: "--SYNTH-400" },
          lineHeight: { floor: "1.5", mobile: "1.4" }, // desktop + wide missing
          letterSpacing: "normal",
          featureSettings: "normal",
          baselineOffset: "1",
        },
      },
    };
    expect(() => validateTypography(tables)).toThrow(/probe\/lineHeight is missing the desktop tier/);
  });

  it("the unit laws: line-height unitless, baseline offset a length", () => {
    const base = {
      families: { "--SYNTH": { stack: "x", metrics: { ascent: 0.9, capHeight: 0.7, descent: 0.2 } } },
      weights: { "--SYNTH-400": "400" },
      sizes: {},
    };
    const voice = (overrides: Record<string, unknown>) => ({
      voices: {
        probe: {
          family: "--SYNTH",
          weights: { default: "--SYNTH-400" },
          lineHeight: "1.4",
          letterSpacing: "normal",
          featureSettings: "normal",
          baselineOffset: "0.03",
          ...overrides,
        },
      },
      ...base,
    });
    // a line-height with a unit would invalidate calc(<length> × <length>)
    expect(() => validateTypography(voice({ lineHeight: "1.2em" }))).toThrow(/unitless ratio/);
    // the baseline offset is a pure factor (× font size); a unit would
    // invalidate the multiplication the engine performs
    expect(() => validateTypography(voice({ baselineOffset: "1px" }))).toThrow(/unitless factor/);
    // tiered values obey the same laws per tier
    expect(() =>
      validateTypography(voice({ lineHeight: { floor: "1.5", mobile: "1.4", desktop: "1.3em", wide: "1.3" } })),
    ).toThrow(/desktop: "1.3em" must be a unitless ratio/);
    expect(() => validateTypography(voice({}))).not.toThrow();
  });

  it("every voice the family speaks has a bundle and a complete ramp", () => {
    for (const [component, member] of Object.entries(FAMILY)) {
      for (const voice of Object.keys(member.voices)) {
        expect(typeVoices[voice], `${component} speaks "${voice}" but the theme defines no such voice`).toBeDefined();
        for (const size of VOICE_SIZES[voice]) {
          const token = sizeTokenName(voice, size);
          expect(typeSizes[token], `${voice}/${size} → --fontSize-${token} has no ramp`).toBeDefined();
          for (const tier of TIERS) {
            expect(typeSizes[token][tier], `--fontSize-${token} is missing ${tier}`).toBeDefined();
          }
        }
      }
    }
  });
});
