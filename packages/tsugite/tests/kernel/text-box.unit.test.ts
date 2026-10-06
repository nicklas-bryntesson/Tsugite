// The text-box engine (ADR-0024): one generated kernel file. These tests hold the output
// to the decision — a cell per voice that has metrics, the voice word unique to voices,
// one formula written twice, and three trim blocks that never apply together.
import { readdirSync } from "node:fs";
import { describe, it, expect } from "vitest";
import { generateTextBoxStylesheet, textBoxVoices, NATIVE_TRIM } from "../../engine/text-box.js";
import { typeVoices } from "../../theme-default/typography.tokens.js";
import { FAMILY } from "../../lib/typographyFamily.ts";

const css = generateTextBoxStylesheet();
const count = (needle: string) => css.split(needle).length - 1;

describe("the text-box engine", () => {
  it("writes one voice cell per voice with block metrics, none for an inline voice", () => {
    const block = Object.entries(typeVoices).filter(([, d]) => !(d as { inline?: boolean }).inline).map(([v]) => v);
    expect(textBoxVoices()).toEqual(block);
    for (const voice of block) expect(count(`[data-voice="${voice}"] {`), voice).toBe(1);
    expect(css).not.toContain('[data-voice="code"]');
  });

  it("every voice the family speaks has a cell", () => {
    const spoken = new Set(Object.values(FAMILY).flatMap((m) => Object.keys(m.voices)));
    for (const voice of spoken) expect(textBoxVoices(), voice).toContain(voice);
  });

  // The voice cells key on data-voice alone, so the word belongs to the voices: a door of
  // the typography family chooses one, any other component writes a constant (Button), and
  // no other table may grow a voice axis of its own.
  it("no non-typography recipe has a voice axis", async () => {
    const typography = new Set(["Heading", "Text", "Caption", "TextBlock"]);
    const dir = new URL("../../recipes/", import.meta.url);
    for (const file of readdirSync(dir).filter((f) => f.endsWith(".recipe.ts"))) {
      const mod = await import(new URL(file, dir).href);
      for (const recipe of Object.values(mod) as Array<{ name?: string; axes?: Record<string, unknown> }>) {
        if (!recipe?.name || typography.has(recipe.name)) continue;
        expect(recipe.axes?.voice, `${recipe.name} has a voice axis`).toBeUndefined();
      }
    }
  });

  it("writes both mode gates", () => {
    const rules = css.split("\n").map((l) => l.trim());
    expect(rules.filter((l) => l === '[data-text-box="inline"] > .text {')).toHaveLength(1);
    // the gate, and the rule inside the not-supported branch
    expect(rules.filter((l) => l === '[data-text-box="block"] > .text {')).toHaveLength(2);
  });

  it("writes the fallback formula twice, identical, and nowhere else", () => {
    const starts = css.match(/margin-block-start: [^;]+;/g) ?? [];
    expect(starts).toHaveLength(2);
    expect(starts[0]).toBe(starts[1]);
    expect(starts[0]).toContain("* 1em");
  });

  it("the native branch excludes a forced region; the forced block lives inside the native branch", () => {
    const native = css.slice(css.indexOf(`@supports ${NATIVE_TRIM}`));
    expect(native).toContain('[data-text-box="block"]:not([data-test-text-box="fallback"] *) > .text');
    expect(native).toContain('[data-test-text-box="fallback"] [data-text-box="block"] > .text');
    expect(css.indexOf(`@supports not (${NATIVE_TRIM})`)).toBeLessThan(css.indexOf(`@supports ${NATIVE_TRIM}`));
  });

  it("states no fallback in any var() — every voice cell fills every slot", () => {
    expect(css).not.toMatch(/var\(--_tbx-[a-zA-Z]+,/);
  });
});
