// TSUGITE RAW COLOR PALETTE — 55 tokens, sju familjer, 100% oklch.
//
// Familjerna:
//   SUMI    墨  neutralrampen, varm greige (hue 74) — washi → yakisugi
//   AI      藍  indigo — varumärkesröst, interaktion, och feedback-info
//   HINOKI  檜  cypress/trä — accentröst. Hue glider 77 → 48, förankrad i
//               fotograferat cederträ (Kusatsu hue 43–53, ranma-bandet 55–61)
//   YU      湯  onsenvatten — ROLL OBESTÄMD, se anteckning nedast
//   KAKI    柿  persimon — feedback-error
//   MATCHA  抹茶            — feedback-success
//   KOHAKU  琥珀 bärnsten   — feedback-warning
//
// L-stegen i SUMI och AI är avsiktligt identiska med de gamla N- och B-ramperna.
// Bara hue och chroma byts, så kontrastrelationerna i det semantiska lagret
// överlever bytet mekaniskt.
//
// Statusfamiljerna har fyra steg var — ett per lägesrad — så feedback-tokens
// blir pekare i stället för mix()-recept. Se FEEDBACK_SHAPE längst ned.

export const rawColorTokens = {
  // ── SUMI 墨 — neutralrampen, hue 74 ────────────────────────────────────────
  // Chroman toppar i midtonerna (0.020) och tunnas ut mot båda ändarna:
  // SUMI-00 är rent papper, SUMI-95 är varm yakisugi-svart.
  "--COLOR-SUMI-00": "oklch(100% 0 74)",
  "--COLOR-SUMI-05": "oklch(98.5% 0.004 74)",
  "--COLOR-SUMI-10": "oklch(97% 0.007 74)",
  "--COLOR-SUMI-15": "oklch(95% 0.010 74)",
  "--COLOR-SUMI-20": "oklch(93% 0.013 74)",
  "--COLOR-SUMI-25": "oklch(89% 0.016 74)",
  "--COLOR-SUMI-30": "oklch(85% 0.018 74)",
  "--COLOR-SUMI-35": "oklch(80% 0.019 74)",
  "--COLOR-SUMI-40": "oklch(75% 0.020 74)",
  "--COLOR-SUMI-45": "oklch(70% 0.020 74)",
  "--COLOR-SUMI-50": "oklch(65% 0.020 74)",
  "--COLOR-SUMI-55": "oklch(58.97% 0.019 74)",
  "--COLOR-SUMI-60": "oklch(52.94% 0.018 74)",
  "--COLOR-SUMI-65": "oklch(46.91% 0.017 74)",
  "--COLOR-SUMI-70": "oklch(40.88% 0.016 74)",
  "--COLOR-SUMI-75": "oklch(34.85% 0.015 74)",
  "--COLOR-SUMI-80": "oklch(28.82% 0.014 74)",
  "--COLOR-SUMI-85": "oklch(22.79% 0.013 74)",
  "--COLOR-SUMI-90": "oklch(16.76% 0.011 74)",
  "--COLOR-SUMI-95": "oklch(11.24% 0.010 74)",

  // ── AI 藍 — indigo ─────────────────────────────────────────────────────────
  // Chroman ned från B:s 0.21 till 0.145 på mittsteget: indigo är ett färgat
  // blått, inte ett skärmblått. AI-60 bär vit text på 7.0:1 där gamla B50 låg
  // runt 4.2 — det är därför feedback-info flyttar från 50 till 60.
  "--COLOR-AI-05": "oklch(96.63% 0.014 258)",
  "--COLOR-AI-10": "oklch(91.11% 0.035 256)",
  "--COLOR-AI-20": "oklch(83.67% 0.065 254)",
  "--COLOR-AI-30": "oklch(74.76% 0.098 256)",
  "--COLOR-AI-40": "oklch(67.38% 0.125 258)",
  "--COLOR-AI-50": "oklch(61.48% 0.145 260)",
  "--COLOR-AI-60": "oklch(46.65% 0.135 262)",
  "--COLOR-AI-70": "oklch(38.13% 0.115 263)",
  "--COLOR-AI-80": "oklch(27.26% 0.085 264)",
  "--COLOR-AI-90": "oklch(18.34% 0.060 264)",
  "--COLOR-AI-95": "oklch(11.28% 0.040 265)",

  // ── HINOKI 檜 — trä, accentrösten ─────────────────────────────────────────
  // Hue glider 77 → 48: värmen fördjupas när den mörknar, som riktigt trä gör.
  "--COLOR-HINOKI-05": "oklch(97% 0.020 77)",
  "--COLOR-HINOKI-20": "oklch(90% 0.060 70)",
  "--COLOR-HINOKI-40": "oklch(79% 0.096 64)",
  "--COLOR-HINOKI-60": "oklch(62% 0.098 57)",
  "--COLOR-HINOKI-80": "oklch(42% 0.078 52)",
  "--COLOR-HINOKI-95": "oklch(23% 0.048 48)",

  // ── YU 湯 — onsenvatten ───────────────────────────────────────────────────
  // ROLL OBESTÄMD. Info bor i AI, och water som röst förkastades. Kvar är
  // dekor: glöd, illustration, dataviz-accent. Sex steg är mycket för det —
  // krymp familjen eller ge den ett jobb innan den flyttar in på riktigt.
  "--COLOR-YU-05": "oklch(96.5% 0.016 205)",
  "--COLOR-YU-10": "oklch(93% 0.028 204)",
  "--COLOR-YU-25": "oklch(86% 0.055 203)",
  "--COLOR-YU-50": "oklch(66% 0.095 206)",
  "--COLOR-YU-70": "oklch(45% 0.070 209)",
  "--COLOR-YU-85": "oklch(27% 0.042 212)",

  // ── Statusfamiljer — fyra steg, ett per lägesrad ──────────────────────────
  // 10 blek ton · 30 lyft · 50 solid · 80 djup
  "--COLOR-KAKI-10": "oklch(93% 0.032 40)",
  "--COLOR-KAKI-30": "oklch(80% 0.115 38)",
  "--COLOR-KAKI-50": "oklch(58% 0.190 32)",
  "--COLOR-KAKI-80": "oklch(41% 0.145 30)",

  "--COLOR-MATCHA-10": "oklch(94% 0.040 148)",
  "--COLOR-MATCHA-30": "oklch(80% 0.090 150)",
  "--COLOR-MATCHA-50": "oklch(55% 0.105 148)",
  "--COLOR-MATCHA-80": "oklch(40% 0.080 150)",

  // KOHAKU hårdnar UPPÅT. Under ungefär L 65 slutar bärnsten vara bärnsten och
  // blir brons, så warning behåller mörk ink i alla fyra rader och låter steget
  // vandra mot ljusare i kontrastläget. KOHAKU-80 är därför TEXT på den bleka
  // tonen, inte en fyllning som sina syskon.
  "--COLOR-KOHAKU-10": "oklch(96% 0.045 88)",
  "--COLOR-KOHAKU-30": "oklch(88% 0.115 85)",
  "--COLOR-KOHAKU-50": "oklch(78% 0.145 78)",
  "--COLOR-KOHAKU-80": "oklch(45% 0.095 70)",
};

// ─────────────────────────────────────────────────────────────────────────────
// VALFRITT: härdningen av CONST→Semantic-seamen.
// Ta bort allt nedanför om du vill ha enbart paletten.
// ─────────────────────────────────────────────────────────────────────────────

/** Den ENDA definitionen av hur en RAW-referens ser ut. Grammatik: FAMILJ-STEG,
    versaler och bindestreck. collector.asColorLiteral, docs/color.astro:paintable
    och tokens.test.ts ska alla importera den här i stället för att hålla var sin
    kopia av /^var\(\(--COLOR-[A-Z0-9]+\)\)$/ — den matchar inte längre. */
export const RAW_REF = /^var\((--COLOR-[A-Z]+-\d{2})\)$/;

/** Plockar ut RAW-namnet ur ett var()-uttryck, eller null om det inte är ett. */
export function rawRefName(value) {
  if (typeof value !== "string") return null;
  const m = value.match(RAW_REF);
  return m && m[1] in rawColorTokens ? m[1] : null;
}

/** Authoring-helper: raw("SUMI-40") → "var(--COLOR-SUMI-40)".
    Kastar på okänt namn, vilket är hela poängen — resolveValue släpper idag
    igenom vilken sträng som helst orörd, så ett stavfel dör först i webbläsaren. */
export function raw(step) {
  const name = `--COLOR-${step}`;
  if (!(name in rawColorTokens)) {
    const near = Object.keys(rawColorTokens)
      .filter((n) => n.startsWith(`--COLOR-${String(step).split("-")[0]}`))
      .join(", ");
    throw new Error(
      `raw(): "${step}" finns inte i paletten.` + (near ? ` Familjen har: ${near}` : ""),
    );
  }
  return `var(${name})`;
}

/** Varje --COLOR-referens i en fabrik måste peka på något som finns.
    Kör den i validateTokens() och validateVoices(). */
export function assertRawReferences(factoryName, table) {
  const problems = [];
  const walk = (node, path) => {
    if (typeof node === "string") {
      for (const hit of node.match(/--COLOR-[A-Za-z0-9-]+/g) ?? []) {
        if (!(hit in rawColorTokens)) problems.push(`${path}: "${hit}" finns inte i paletten`);
      }
    } else if (node && typeof node === "object") {
      for (const [k, v] of Object.entries(node)) walk(v, `${path}/${k}`);
    }
  };
  walk(table, factoryName);
  if (problems.length) throw new Error(`Trasiga RAW-referenser:\n${problems.join("\n")}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// MIGRERING — gammalt namn → nytt. Använd den här, inte sed.
// ─────────────────────────────────────────────────────────────────────────────

export const LEGACY_MAP = {
  // N → SUMI, 1:1 på alla 20 steg
  ...Object.fromEntries(
    ["00","05","10","15","20","25","30","35","40","45","50","55","60","65","70","75","80","85","90","95"]
      .map((s) => [`--COLOR-N${s}`, `--COLOR-SUMI-${s}`]),
  ),
  // B → AI, 1:1
  ...Object.fromEntries(
    ["05","10","20","30","40","50","60","70","80","90","95"]
      .map((s) => [`--COLOR-B${s}`, `--COLOR-AI-${s}`]),
  ),
  // PI → HINOKI. INTE 1:1 — fem steg blir sex och inget stegnummer är gemensamt.
  // Mappat på närmaste L: PI10 L96→HINOKI-05 L97, PI25 L88→20 L90,
  // PI50 L67→60 L62, PI70 L34→80 L42, PI85 L24→95 L23.
  // HINOKI-40 (L79) är nytt och har ingen PI-motsvarighet.
  "--COLOR-PI10": "--COLOR-HINOKI-05",
  "--COLOR-PI25": "--COLOR-HINOKI-20",
  "--COLOR-PI50": "--COLOR-HINOKI-60",
  "--COLOR-PI70": "--COLOR-HINOKI-80",
  "--COLOR-PI85": "--COLOR-HINOKI-95",
  // Status. OBS att siffran ändras på warning.
  "--COLOR-R50": "--COLOR-KAKI-50",
  "--COLOR-G50": "--COLOR-MATCHA-50",
  "--COLOR-Y80": "--COLOR-KOHAKU-50", // ⚠️ 80 → 50. KOHAKU-80 är en helt annan
                                      //    färg (mörk brons) och används som TEXT.
};

/** Tokens som försvinner utan ersättare. Ingen fabrik refererar dem idag. */
export const RETIRED = ["--COLOR-YE05", "--COLOR-YE20", "--COLOR-YE50", "--COLOR-YE70", "--COLOR-YE95"];

// ─────────────────────────────────────────────────────────────────────────────
// FEEDBACK — den enda semantiska formen som ändras.
// Tolv mix()-recept blir fyra pekare per roll. onWarning är NYTT.
// ─────────────────────────────────────────────────────────────────────────────

export const FEEDBACK_SHAPE = `
"--color-feedback-error":   { light: raw("KAKI-50"),   dark: raw("KAKI-30"),
                              "light-contrast": raw("KAKI-80"),   "dark-contrast": raw("KAKI-10") },
"--color-feedback-success": { light: raw("MATCHA-50"), dark: raw("MATCHA-30"),
                              "light-contrast": raw("MATCHA-80"), "dark-contrast": raw("MATCHA-10") },
"--color-feedback-info":    { light: raw("AI-60"),     dark: raw("AI-30"),
                              "light-contrast": raw("AI-80"),     "dark-contrast": raw("AI-10") },

// Warning hårdnar uppåt: samma ink i alla fyra rader, steget flyttar.
"--color-feedback-warning": { light: raw("KOHAKU-50"), dark: raw("KOHAKU-30"),
                              "light-contrast": raw("KOHAKU-10"), "dark-contrast": raw("KOHAKU-10") },

// NYTT — warning är den enda rollen vars ink inte är vit i ljust läge.
// Kräver också --ui-warning-foreground i seam.ui.tokens.js.
"--color-feedback-onWarning": { light: raw("SUMI-95"), dark: raw("SUMI-95"),
                                "light-contrast": raw("SUMI-95"), "dark-contrast": raw("SUMI-95") },
`;
