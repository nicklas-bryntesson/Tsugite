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
