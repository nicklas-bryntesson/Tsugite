// The components tree and the export map agree: every component folder under
// components/<pillar>[/<family>]/<Name> is exported as "./<Name>/*", and nothing else
// is. The path is the truth about where a component lives; the map is what consumers
// import by, so the tree can move again without anyone outside noticing.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { describe, it, expect } from "vitest";

const root = fileURLToPath(new URL("../components", import.meta.url));
const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")) as { exports: Record<string, string> };

/** A component folder is a directory that holds a file named after itself. */
function componentDirs(dir: string, rel = ""): Array<{ name: string; rel: string }> {
  const out: Array<{ name: string; rel: string }> = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (!statSync(full).isDirectory()) continue;
    const here = rel ? `${rel}/${entry}` : entry;
    const own = readdirSync(full).some((f) => f.startsWith(`${entry}.`));
    if (own) out.push({ name: entry, rel: here });
    else out.push(...componentDirs(full, here));
  }
  return out;
}

const dirs = componentDirs(root);

describe("the components tree", () => {
  it("has one folder per component, under a pillar or beside them as infrastructure", () => {
    const pillars = ["primitives", "compositions", "regions"];
    for (const { name, rel } of dirs) {
      const top = rel.split("/")[0];
      expect(pillars.includes(top) || rel === name, `${rel}: a component sits under a pillar, or at the top as infrastructure (DevError)`).toBe(true);
    }
  });

  it("is exported by name, one entry per component, and nothing else by name", () => {
    const byName = Object.entries(pkg.exports).filter(([k]) => k !== "./*");
    const expected = Object.fromEntries(dirs.map(({ name, rel }) => [`./${name}/*`, `./components/${rel}/*`]));
    expect(Object.fromEntries(byName)).toEqual(expected);
  });

  it("keeps the catch-all last, for fixtures, lib, recipes, engine and styles", () => {
    const keys = Object.keys(pkg.exports);
    expect(keys[keys.length - 1]).toBe("./*");
  });
});
