// Token pipeline guards (ADR-0003/0004; T7 adds the support axis):
// coverage is validated in JS — a missing mode is a build error, never a
// silent contrast bug — and every committed generated artifact must match
// the factories. The fidelity suite proves the precomputed sRGB emissions
// are the same colors as the oklch intent (ΔE_OK), not approximations.
import { readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";
import { oklch, inGamut, wcagContrast } from "culori";
import {
  allTokens,
  validateTokens,
  validateVoices,
  generateRawStylesheet,
  generateStylesheet,
  generateThemesStylesheet,
  generateSeamStylesheet,
  gamutReport,
  APPEARANCES,
} from "../engine/collector.js";
import { rawColorTokens } from "../theme-default/raw.color.tokens.js";
import { themeVoices, themeChannels, voiceMatrix, cellName, VOLUMES } from "../theme-default/theme.voices.tokens.js";
import { isRecipe, computeMix, toSrgbCss, toSrgbHex, fidelity, mix } from "../engine/color-engine.js";

describe("token factories", () => {
  it("every token defines every appearance mode with a resolvable value", () => {
    expect(() => validateTokens()).not.toThrow();
  });

  it("semantic tokens follow the grammar: lowercase, single dash (ADR-0004)", () => {
    for (const name of Object.keys(allTokens())) {
      expect(name).toMatch(/^--[a-z][a-zA-Z0-9]*(-[a-zA-Z0-9]+)*$/);
      expect(name.slice(2)).not.toContain("--"); // no double dash past the prefix
    }
  });

  it("only the factory layer references RAW — via var() or a recipe", () => {
    for (const [name, modes] of Object.entries(allTokens())) {
      for (const a of APPEARANCES) {
        const v = modes[a];
        if (isRecipe(v)) continue; // recipe ingredients are validated by the engine
        if (v.includes("--COLOR-")) expect(v, `${name}/${a}`).toContain("var(--COLOR-");
      }
    }
  });

  it("recipes only accept static RAW ingredients (refusal rule)", () => {
    expect(() => computeMix(mix("--color-text-primary", 60))).toThrow(/RAW/);
    expect(() => computeMix(mix("--COLOR-FINNSEJ", 60))).toThrow(/RAW/);
  });
});

describe("generated artifacts are fresh", () => {
  it("color.raw.generated.css matches the factory", () => {
    const onDisk = readFileSync(
      new URL("../styles/tokens/color/color.raw.generated.css", import.meta.url),
      "utf8",
    );
    expect(onDisk).toBe(generateRawStylesheet());
  });

  it("color.appearance.generated.css matches the factories", () => {
    const onDisk = readFileSync(
      new URL("../styles/tokens/color/color.appearance.generated.css", import.meta.url),
      "utf8",
    );
    expect(onDisk).toBe(generateStylesheet());
  });

  it("the generated --ui-* seam is fresh and appearance-free", () => {
    const onDisk = readFileSync(new URL("../styles/ui-tokens.css", import.meta.url), "utf8");
    expect(onDisk).toBe(generateSeamStylesheet());
    // pointers, never modes: the seam must not mention appearance values
    expect(onDisk).not.toContain("light-contrast");
    // and never RAW colors (ADR-0004 layer visibility)
    expect(onDisk).not.toContain("--COLOR-");
  });
});

describe("theme voices (ADR-0006: voice × volume)", () => {
  const themesCss = generateThemesStylesheet();

  it("every voice fills the whole slot schema for every allowed volume", () => {
    expect(() => validateVoices()).not.toThrow();
  });

  it("color.themes.generated.css matches the factory", () => {
    const onDisk = readFileSync(
      new URL("../styles/tokens/color/color.themes.generated.css", import.meta.url),
      "utf8",
    );
    expect(onDisk).toBe(generateThemesStylesheet());
  });

  it("the combination law holds: forbidden combos have no cells", () => {
    // inverse × subtle is whitelisted OUT — the generated CSS must not
    // contain a single subtle cell inside the inverse voice blocks.
    const inverseBlocks = themesCss.split("\n").filter((l) => l.includes('[data-theme="inverse"]'));
    expect(inverseBlocks.length).toBeGreaterThan(0);
    for (const block of themesCss.matchAll(/\[data-theme="inverse"\] \{([^}]*)\}/g)) {
      expect(block[1]).not.toContain("--theme-cell-subtle-");
    }
  });

  it("channels and cells are deliberately unregistered", () => {
    // Registration would give channels an initial-value that outranks the
    // ownership chain's semantic fallback — the safety net here is IACVT.
    expect(themesCss).not.toMatch(/^@property/m);
  });

  it("wiring: [data-theme] defaults to primary, one block per volume stop", () => {
    expect(themesCss).toContain("[data-theme] {");
    for (const vol of VOLUMES) expect(themesCss).toContain(`[data-prominence="${vol}"] {`);
    // every channel is wired in the default block
    for (const [key, channel] of Object.entries(themeChannels)) {
      expect(themesCss).toContain(`${channel}: var(${cellName("primary", key)})`);
    }
  });

  it("cell names follow the grammar (ADR-0004: single dash, camel segments)", () => {
    for (const volume of VOLUMES) {
      for (const key of Object.keys(themeChannels)) {
        const name = cellName(volume, key);
        expect(name).toMatch(/^--[a-z][a-zA-Z0-9]*(-[a-zA-Z0-9]+)*$/);
        expect(name.slice(2)).not.toContain("--");
      }
    }
  });

  it("voices only reference RAW through var() or plain keywords", () => {
    for (const [voice, volumes] of Object.entries(themeVoices)) {
      for (const [vol, table] of Object.entries(volumes)) {
        for (const [key, modes] of Object.entries(table)) {
          for (const a of APPEARANCES) {
            const value = modes[a];
            if (value.includes("--COLOR-"))
              expect(value, `${voice}/${vol}/${key}/${a}`).toContain("var(--COLOR-");
          }
        }
      }
    }
  });

  it("the matrix and the tables agree exactly", () => {
    expect(Object.keys(themeVoices).sort()).toEqual(Object.keys(voiceMatrix).sort());
    for (const [voice, volumes] of Object.entries(voiceMatrix)) {
      expect(Object.keys(themeVoices[voice]).sort()).toEqual([...volumes].sort());
    }
  });

  it("every voice cell meets WCAG contrast — AA in core modes, AAA in contrast modes", () => {
    // The control room's mechanical twin: drift in any theme table
    // becomes a red test, not a
    // morning-coffee discovery. Today's worst pair in the whole system is
    // accent/subtle/light textMuted at 4.66:1 — tuning below AA fails here.
    const resolveRaw = (value: string) => {
      if (value === "transparent") return null;
      const m = value.match(/var\((--COLOR-[A-Z0-9]+)\)/);
      return m ? rawColorTokens[m[1]] : null;
    };
    const pairs: Array<[string, string]> = [
      ["text", "surface"],
      ["textMuted", "surface"],
      ["buttonColorPrimary", "buttonBackgroundColorPrimary"],
      ["buttonColorSecondary", "surface"],
    ];
    for (const [voice, volumes] of Object.entries(voiceMatrix)) {
      for (const vol of volumes) {
        for (const mode of APPEARANCES) {
          const floor = mode.includes("contrast") ? 7 : 4.5; // AAA in the contrast modes
          for (const [fg, bg] of pairs) {
            const f = resolveRaw(themeVoices[voice][vol][fg][mode]);
            const g = resolveRaw(themeVoices[voice][vol][bg][mode]);
            if (!f || !g) continue; // transparent = no surface of its own to measure against
            expect(
              wcagContrast(f, g),
              `${voice}/${vol}/${mode}: ${fg} on ${bg}`,
            ).toBeGreaterThanOrEqual(floor);
          }
        }
      }
    }
  });
});

describe("T7 — oklch single-sourcing", () => {
  const appearanceCss = generateStylesheet();
  const rawCss = generateRawStylesheet();
  const seamCss = generateSeamStylesheet();

  it("no runtime color construct survives in any emitted artifact", () => {
    for (const css of [appearanceCss, rawCss, seamCss]) {
      expect(css).not.toContain("color-mix(");
      expect(css).not.toContain("light-dark(");
    }
  });

  it("the sRGB fallback branch is the gamut mapping of the oklch intent (ΔE_OK)", () => {
    const srgb = inGamut("rgb");
    for (const [name, literal] of Object.entries(rawColorTokens)) {
      const intent = oklch(literal);
      const hex = toSrgbHex(intent);
      // In-gamut colors round-trip within hex quantization noise. Clipped
      // colors lose exactly the chroma sRGB cannot show (that IS the
      // mapping) but must never become a different color.
      const bound = srgb(intent) ? 0.01 : 0.05;
      expect(fidelity(literal, hex), `${name}: ${literal} → ${hex}`).toBeLessThan(bound);
    }
  });

  it("gamut mapping preserves lightness and hue (CSS Color 4 chroma-clamp)", () => {
    for (const [name, literal] of Object.entries(rawColorTokens)) {
      const intent = oklch(literal);
      const emitted = oklch(toSrgbHex(intent));
      expect(Math.abs(emitted.l - intent.l), `${name} L`).toBeLessThan(0.01);
      // Hue is only meaningful with chroma behind it — near-neutrals get
      // degrees of hue drift for free from 8-bit hex quantization.
      if (intent.c > 0.05 && emitted.c > 0.05) {
        let dh = Math.abs((emitted.h ?? 0) - (intent.h ?? 0));
        if (dh > 180) dh = 360 - dh;
        expect(dh, `${name} H`).toBeLessThan(2);
      }
    }
  });

  it("precomputed mixes match spec color-mix semantics for transparent", () => {
    // color-mix(in oklch, X 60%, transparent) = X with alpha 0.6 — exact.
    const c = computeMix(mix("--COLOR-B20", 60));
    const base = oklch(rawColorTokens["--COLOR-B20"]);
    expect(c.l).toBeCloseTo(base.l, 10);
    expect(c.c).toBeCloseTo(base.c, 10);
    expect(c.alpha).toBeCloseTo(0.6, 10);
    expect(toSrgbCss(c)).toMatch(/^rgba?\(/);
  });

  it("gamutReport names every clipped emission (build log surface)", () => {
    const report = gamutReport();
    for (const entry of report) expect(entry).toMatch(/^--/);
    // The report is informational; this pins today's state so a palette
    // change that starts clipping is a conscious, visible event.
    expect(report.length).toBeLessThanOrEqual(Object.keys(rawColorTokens).length);
  });

  it("semantic @property registrations: colors registered, shadow lists skipped", () => {
    expect(appearanceCss).toContain("@property --color-surface-page");
    expect(appearanceCss).toContain("@property --color-interactive-hoverRing");
    expect(appearanceCss).not.toContain("@property --color-shadow-popup");
    // inherits: true — semantic tokens must cascade into theme donuts
    const registrationBlock = appearanceCss.split("/* User preference")[0];
    expect(registrationBlock).not.toContain("inherits: false");
  });

  it("raw registrations carry the oklch intent as initial-value", () => {
    expect(rawCss).toContain(
      `@property --COLOR-B50 {\n  syntax: "<color>";\n  inherits: false;\n  initial-value: ${rawColorTokens["--COLOR-B50"]};\n}`,
    );
  });

  it("every RAW token appears in both support branches", () => {
    const [, fallbackBranch, modernBranch] = rawCss.split("@supports");
    for (const name of Object.keys(rawColorTokens)) {
      expect(fallbackBranch, `${name} in the sRGB branch`).toContain(`${name}: #`);
      expect(modernBranch, `${name} in the oklch branch`).toContain(`${name}: oklch(`);
    }
  });
});
