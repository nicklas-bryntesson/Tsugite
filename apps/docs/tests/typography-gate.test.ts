// THE TYPOGRAPHY GATE (T9, tasks/plan.md) — drift must not return.
//
// Every typography declaration in both workspaces must resolve through
// tokens. The census matches PER DECLARATION (a raw value sharing a line
// with a var(--color-…) is still raw — the line-based grep missed those).
// The allowlist is the reviewed class-A set, with expected counts: a new
// raw declaration — even one identical to an allowlisted one — fails the
// build and must be argued into this list in a diff.
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";

const repoRoot = fileURLToPath(new URL("../../..", import.meta.url));

const SCAN_ROOTS = [
  "packages/tsugite/components",
  "packages/tsugite/fixtures",
  "packages/tsugite/styles",
  "apps/docs/src",
];

const EXTENSIONS = [".css", ".astro"];
const SKIP = [/node_modules/, /\.generated\.css$/, /styles\/ui-tokens\.css$/];

const DECLARATION =
  /(font-size|font-weight|font-family|line-height|letter-spacing|text-transform)\s*:\s*([^;{}"']*)/g;

/** The class-A allowlist: file → normalized declaration → expected count.
    Categories: @font-face infrastructure · mechanical trims (icon/glyph
    alignment) · Prose's relative inline-code mechanism (0.875em/1em) ·
    deliberate test stimuli · bench instruments (1cap, lowercase) · the ja
    fallback stack (G6) · tracked-caps manner pending the Eyebrow primitive. */
const ALLOWLIST: Record<string, Record<string, number>> = {
  "apps/docs/src/styles/base/font.css": {
    // quoted family names are clipped by the scanner; the property is the marker
    "font-family:": 8,
    "font-weight: 600": 2,
    "font-weight: 400": 4,
    "font-weight: 700": 2,
  },
  "apps/docs/src/styles/global.css": {
    "font-family:": 1, // the ja stack: value spans lines; the property is the marker (G6)
  },
  "apps/docs/src/styles/templates/kitchenSink.css": {
    "line-height: 1cap": 2,
    "text-transform: lowercase": 1,
  },
  "apps/docs/src/styles/ui/Tables.css": {
    // bench anchor: table cells host embedded component demos whose
    // em-based geometry the conformance suites measure — the context
    // must not breathe with the tier
    "font-size: 1rem": 2,
  },
  "apps/docs/src/pages/map.astro": {
    "letter-spacing: 0.1em": 1,
    "letter-spacing: 0.08em": 1,
    "letter-spacing: 0": 1,
    "text-transform: uppercase": 1,
  },
  "apps/docs/src/pages/control-room.astro": {
    "letter-spacing: 0.08em": 1,
    "text-transform: uppercase": 1,
  },
  "apps/docs/src/pages/docs/color.astro": {
    "letter-spacing: 0.08em": 1,
    "text-transform: uppercase": 1,
    "font-size: 0.875em": 1,
  },
  "apps/docs/src/pages/docs/[slug].astro": {
    "font-size: 0.875em": 1,
  },
  "apps/docs/src/pages/docs/tiers.astro": {
    "font-size: 0.875em": 1,
    "font-size: var($": 1, // specimen template literal — renders the token itself
  },
  "packages/tsugite/components/Prose/Prose.astro": {
    "font-size: 0.875em": 3,
    "font-size: 1em": 1,
  },
  "packages/tsugite/components/AffixField/AffixField.astro": { "line-height: 1": 1 },
  "packages/tsugite/components/FileUpload/FileUpload.astro": { "line-height: 1": 1 },
  "packages/tsugite/components/WeekField/WeekField.astro": { "line-height: 1": 1 },
  "packages/tsugite/components/DateField/DateField.astro": { "line-height: 1": 1 },
  "packages/tsugite/components/DateTimeField/DateTimeField.astro": { "line-height: 1": 1 },
  // test stimuli: the raw value IS the test; ") " variants are the visible
  // label text naming the stimulus
  "packages/tsugite/fixtures/RangeFieldSection.astro": { "font-size: 1.5rem": 1, "font-size: 1.5rem)": 1 },
  "packages/tsugite/fixtures/RangeScaleSection.astro": { "font-size: 1.5rem": 1, "font-size: 1.5rem)": 1 },
};

function* walk(dir: string): Generator<string> {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (SKIP.some((re) => re.test(path))) continue;
    if (entry.isDirectory()) yield* walk(path);
    else if (EXTENSIONS.some((ext) => entry.name.endsWith(ext))) yield path;
  }
}

const normalize = (prop: string, value: string) =>
  `${prop}: ${value.trim().replace(/\s+/g, " ")}`.trim().replace(/:\s*$/, ":");

describe("the typography gate", () => {
  it("every typography declaration resolves through tokens (or is an argued allowlist entry)", () => {
    const offenders: string[] = [];

    for (const root of SCAN_ROOTS) {
      for (const file of walk(join(repoRoot, root))) {
        const rel = relative(repoRoot, file);
        const source = readFileSync(file, "utf8");
        const seen: Record<string, number> = {};

        for (const match of source.matchAll(DECLARATION)) {
          const value = match[2];
          if (value.includes("var(--") || value.trim() === "inherit") continue;
          const decl = normalize(match[1], value);
          seen[decl] = (seen[decl] ?? 0) + 1;
        }

        for (const [decl, count] of Object.entries(seen)) {
          const allowed = ALLOWLIST[rel]?.[decl] ?? 0;
          if (count > allowed) {
            offenders.push(`${rel} — "${decl}" ×${count} (allowlisted: ${allowed})`);
          }
        }
      }
    }

    expect(offenders, `raw typography declarations outside the allowlist:\n${offenders.join("\n")}`).toEqual([]);
  });
});
