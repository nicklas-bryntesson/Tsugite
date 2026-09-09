// THE POPUP-ANCHOR ADOPTION GATE — the wiring is written once, and stays so.
//
// Six components used to carry private copies of the popup wiring around
// kernel/js/popup-position.ts: a px probe, a layout routine, a rAF resize
// handler, an outside-click dismiss. kernel/js/popup-anchor.ts owns that wiring
// now (ToggleTip first, then the five date fields). This gate fails the build
// the day a component script grows one of those copies back: a private probe,
// a direct import of the position math, or its own window resize listener.
//
// Deletable (ADR-0009) together with the rail: when popups move to the Popover
// API + top layer, popup-anchor and this gate go in the same commit.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";

const componentsDir = fileURLToPath(new URL("../../components", import.meta.url));

function componentScripts(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) componentScripts(full, out);
    else if (full.endsWith(".ts")) out.push(full);
  }
  return out;
}

const FORBIDDEN: Array<{ label: string; pattern: RegExp }> = [
  { label: "a private px probe (_getCSSPx / a probe div) — use readCssPx or layoutPopup", pattern: /_getCSSPx|probe = document\.createElement/ },
  { label: "a direct import of the position math — go through popup-anchor", pattern: /from ['"]\.\.\/\.\.\/kernel\/js\/popup-position['"]/ },
  { label: "its own window resize listener — use watchResize", pattern: /window\.addEventListener\(\s*['"]resize['"]/ },
  { label: "an outside-click handler of its own — use lightDismiss", pattern: /_outsideClickHandler/ },
];

describe("popup-anchor adoption gate", () => {
  const files = componentScripts(componentsDir);

  it("scans the component scripts (the gate is measuring something)", () => {
    expect(files.length).toBeGreaterThan(5);
  });

  for (const file of files) {
    const rel = relative(componentsDir, file);
    it(`${rel} carries no private copy of the popup wiring`, () => {
      const src = readFileSync(file, "utf8");
      const hits = FORBIDDEN.filter(({ pattern }) => pattern.test(src)).map(({ label }) => label);
      expect(hits, `${rel} reintroduces: ${hits.join("; ")}`).toEqual([]);
    });
  }
});
