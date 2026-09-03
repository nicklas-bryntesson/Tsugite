// THE DOCS MANIFEST — pages as data (/map + flat /docs URLs).
//
// One row per component in the visible inventory. The PILLAR is a data
// column, never a URL segment — reclassifying is a field edit, no broken
// links. /map and /docs/[slug] render from here; `published` is the gate.
//
// Pillars (ownership contracts, not size):
//   primitive    owns its own vocabulary, IS content
//   composition  owns arrangement + theme claims only
//   region       governs a capability over hosted content, projects state
//   chrome       the site's shell (Header/Footer) — its own box on the map
// `family: "fields"` is a BADGE within primitives (shared field contracts).

export type Pillar = "primitive" | "composition" | "region" | "chrome";

export interface ManifestEntry {
  slug: string;
  title: string;
  pillar: Pillar;
  /** Family badge within the pillar (only "fields" today). */
  family?: "fields";
  /** Where the component came from — metadata, never grouping. */
  origin: "aipoc" | "ref-comps" | "own";
  /** Section basename in the package fixtures/ (no .astro).
      Slugs may share a section (Card/Picture/Teaser live in Components). */
  section?: string;
  /** When the demo lives elsewhere (e.g. the start page). */
  demoHref?: string;
  /** Conformance suite file, repo-relative. */
  suite?: string;
  /** ADR numbers governing the component. */
  adrs?: string[];
  published: boolean;
}

export const manifest: ManifestEntry[] = [
  // ── Primitives ──────────────────────────────────────────────────────────────
  { slug: "heading", title: "Heading", pillar: "primitive", origin: "aipoc", section: "Typography", published: true },
  { slug: "text", title: "Text", pillar: "primitive", origin: "own", section: "TextSection", published: true },
  { slug: "text-block", title: "TextBlock", pillar: "primitive", origin: "own", section: "TextBlockSection", published: true },
  { slug: "prose", title: "Prose", pillar: "primitive", origin: "aipoc", section: "ProseSection", published: true },
  { slug: "button", title: "Button", pillar: "primitive", origin: "aipoc", section: "Buttons", adrs: ["0005", "0006"], published: true },
  { slug: "cta-button", title: "CtaButton", pillar: "primitive", origin: "aipoc", section: "CtaButtonSection", published: true },
  { slug: "card", title: "Card", pillar: "primitive", origin: "aipoc", section: "Components", published: true },
  { slug: "picture", title: "Picture", pillar: "primitive", origin: "aipoc", section: "Components", published: true },
  { slug: "notice", title: "Notice", pillar: "primitive", origin: "ref-comps", section: "NoticeSection", suite: "tests/e2e/notice.e2e.test.js", published: true },
  { slug: "toggletip", title: "ToggleTip", pillar: "primitive", origin: "ref-comps", section: "ToggleTipSection", suite: "tests/e2e/toggletip.e2e.test.js", published: true },
  { slug: "theme-switch", title: "ThemeSwitch", pillar: "primitive", family: "fields", origin: "ref-comps", section: "ThemeSwitchSection", suite: "tests/e2e/themeswitch.e2e.test.js", adrs: ["0003"], published: true },

  // ── Primitives · the fields family ──────────────────────────────────────────
  { slug: "choice-field", title: "ChoiceField", pillar: "primitive", family: "fields", origin: "ref-comps", section: "ChoiceFieldSection", suite: "tests/e2e/choicefield.e2e.test.js", published: true },
  { slug: "choice-group", title: "ChoiceGroup", pillar: "primitive", family: "fields", origin: "ref-comps", section: "ChoiceGroupSection", suite: "tests/e2e/choicegroup.e2e.test.js", published: true },
  { slug: "picklist", title: "Picklist", pillar: "primitive", family: "fields", origin: "ref-comps", section: "PicklistSection", suite: "tests/e2e/picklist.e2e.test.js", published: true },
  { slug: "range-field", title: "RangeField", pillar: "primitive", family: "fields", origin: "ref-comps", section: "RangeFieldSection", suite: "tests/e2e/rangefield.e2e.test.js", published: true },
  { slug: "range-scale", title: "RangeScale", pillar: "primitive", family: "fields", origin: "ref-comps", section: "RangeScaleSection", suite: "tests/e2e/rangescale.e2e.test.js", published: true },
  { slug: "range-group", title: "RangeGroup", pillar: "primitive", family: "fields", origin: "ref-comps", section: "RangeGroupSection", suite: "tests/e2e/rangegroup.e2e.test.js", published: true },
  { slug: "affix-field", title: "AffixField", pillar: "primitive", family: "fields", origin: "ref-comps", section: "AffixFieldSection", suite: "tests/e2e/affixfield.e2e.test.js", published: true },
  { slug: "date-field", title: "DateField", pillar: "primitive", family: "fields", origin: "ref-comps", section: "DateFieldSection", suite: "tests/e2e/datefield.e2e.test.js", published: true },
  { slug: "date-time-field", title: "DateTimeField", pillar: "primitive", family: "fields", origin: "ref-comps", section: "DateTimeFieldSection", suite: "tests/e2e/datetimefield.e2e.test.js", published: true },
  { slug: "time-field", title: "TimeField", pillar: "primitive", family: "fields", origin: "ref-comps", section: "TimeFieldSection", suite: "tests/e2e/timefield.e2e.test.js", published: true },
  { slug: "month-field", title: "MonthField", pillar: "primitive", family: "fields", origin: "ref-comps", section: "MonthFieldSection", suite: "tests/e2e/monthfield.e2e.test.js", published: true },
  { slug: "week-field", title: "WeekField", pillar: "primitive", family: "fields", origin: "ref-comps", section: "WeekFieldSection", suite: "tests/e2e/weekfield.e2e.test.js", published: true },
  { slug: "file-upload", title: "FileUpload", pillar: "primitive", family: "fields", origin: "ref-comps", section: "FileUploadSection", suite: "tests/e2e/fileupload.e2e.test.js", published: true },

  // ── Compositions ────────────────────────────────────────────────────────────
  { slug: "teaser", title: "Teaser", pillar: "composition", origin: "aipoc", section: "Components", published: true },
  { slug: "cover-composition", title: "CoverComposition", pillar: "composition", origin: "own", demoHref: "/", suite: "tests/e2e/themes.e2e.test.js", adrs: ["0005", "0006"], published: true },

  // ── Regions ─────────────────────────────────────────────────────────────────
  { slug: "motion-region", title: "MotionRegion", pillar: "region", origin: "ref-comps", section: "MotionRegionSection", suite: "tests/e2e/motionregion.e2e.test.js", published: true },
  { slug: "scroll-area", title: "ScrollArea", pillar: "region", origin: "ref-comps", section: "ScrollAreaSection", suite: "tests/e2e/scrollarea.e2e.test.js", published: true },

  // ── Chrome ──────────────────────────────────────────────────────────────────
  { slug: "header", title: "Header", pillar: "chrome", origin: "own", demoHref: "/", suite: "tests/e2e/header.e2e.test.js", published: true },
  { slug: "footer", title: "Footer", pillar: "chrome", origin: "aipoc", demoHref: "/", published: true },
];

/** The ground strip on /map: the no-DOM material everything stands on. */
export const foundations = [
  { slug: "color", title: "Color", href: "/docs/color", note: "RAW · semantic roles · voices", published: true },
  { slug: "tiers", title: "Tiers", href: "/docs/tiers", note: "FLOOR → WIDE + site offset", published: true },
];

export const kernelModules = [
  "theme-preference",
  "motion-policy",
  "popup-interaction",
  "popup-position",
  "WheelColumn",
];

// The Tsugite vocabulary: the pillars carry the exact mental models of
// traditional Japanese joinery. Tsugite (継手) — the joints themselves —
// names the whole library; the tiers map onto the craft:
//   kigumi (木組み)  the precisely prepared timber pieces  → primitives
//   kumiko (組子)    arranging pieces into patterns        → compositions
//   masugumi (枡組)  nested brackets absorbing forces      → regions
//   dodai (土台)     the ground sill everything rests on   → foundations
// English is the primary, machine-first vocabulary; the Japanese craft
// terms are the finer label (an eyebrow above the heading).
export const pillarLabels: Record<Pillar, string> = {
  primitive: "Primitives",
  composition: "Compositions",
  region: "Regions",
  chrome: "Chrome",
};

export const pillarMeta: Record<Pillar, { romaji?: string; kanji?: string }> = {
  primitive: { romaji: "Kigumi", kanji: "木組み" },
  composition: { romaji: "Kumiko", kanji: "組子" },
  region: { romaji: "Masugumi", kanji: "枡組" },
  chrome: {},
};

export const foundationsMeta = { label: "Foundations", romaji: "Dodai", kanji: "土台" };
