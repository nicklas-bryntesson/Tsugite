// The map and the tree agree: a manifest entry's pillar and family are where its
// folder sits, components/<pillar>s/[<family>/]<Title>. The path is the truth about
// a component's classification; the manifest repeats it for the docs app, and this
// test keeps the repetition honest. The site's shell lives in the docs app and has no row.
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { describe, it, expect } from "vitest";
import { manifest } from "../src/lib/manifest.ts";

const components = fileURLToPath(new URL("../../../packages/tsugite/components", import.meta.url));
const folder: Record<string, string> = { primitive: "primitives", composition: "compositions", region: "regions" };

describe("the manifest agrees with the components tree", () => {
  for (const entry of manifest) {
    it(`${entry.title} sits under ${folder[entry.pillar]}${entry.family ? "/" + entry.family : ""}`, () => {
      const dir = join(components, folder[entry.pillar], entry.family ?? "", entry.title);
      expect(existsSync(dir), `${dir} does not exist — the manifest says ${entry.pillar}${entry.family ? "/" + entry.family : ""}, the tree disagrees`).toBe(true);
    });
  }
});
