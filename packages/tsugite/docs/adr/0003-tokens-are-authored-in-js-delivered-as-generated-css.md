# ADR-0003: Färgtokens författas i JS, levereras som genererad CSS

**Status:** Accepted · 2026-08-31 · Evidens: `/theme-lab` + `tests/e2e/theme-lab.e2e.test.js`

## Kontext

Systemet har fyra appearance-lägen — `light`, `dark`, `light-contrast`,
`dark-contrast` — plus preferensen `system` som resolvas mot OS-signalerna.
Att uttrycka N tokens × 4 lägen direkt i CSS-kaskad havererar dokumenterat
(se `old-pattern.css` i Craft-experimentet: överlappande block, copy-paste,
tabellen "uppstår" i stället för att stå någonstans, ingen täckningsvalidering).
Lookupen hör hemma i ett språk som har lookups.

Två leveranser av samma författarmodell A/B-testades empiriskt (PR #5):
runtime `style.cssText` (Craft-modellen) mot build-genererad CSS + attributflipp.

| Mätning | A (runtime) | B (genererad) |
|---|---|---|
| JS på — växling, preferens vinner över OS | ✅ | ✅ identisk |
| Utan JS + OS dark | ❌ fast i bakad light | ✅ följer OS |
| Utan JS + OS contrast | ❌ mellanton kvar | ✅ kollapsar korrekt |
| Aktiv värdemängd i inspektorn | `element.style`, anonym | EN namngiven, källänkad regel |
| Payload | kartor som JS i varje sida | en CSS, cachas |
| CSP | style-attribut + inline-kartor kräver undantag | endast resolver-scriptet (hashbart) |

## Beslut

1. **Författande:** varje komponent äger en tokentabell
   (`<Name>.color.tokens`-fabrik) där varje token deklarerar alla fyra
   lägesvärden explicit. En central collector aggregerar fabrikerna.
   Täckning valideras i JS/TS — ett saknat läge är ett byggfel, aldrig en
   tyst kontrastbugg.
2. **Leverans:** collectorn genererar i **build** ömsesidigt exklusiva
   CSS-block per läge, nycklade på `data-appearance`, plus media-avgränsade
   fallback-block för attribut-frånvaro. Exakt ett block matchar vid varje
   tidpunkt (samma slutna-grenar-princip som ADR-0001).
3. **Runtime:** ett renderblockande head-script gör EN sak — resolvar
   fyrvärdes-läget (persistad preferens + `prefers-color-scheme` +
   `prefers-contrast`) och målar `data-appearance`. Utan JS ger
   fallback-blocken korrekt läge för alla fyra kombinationer — inklusive
   kontrastlägena, som är de tillgänglighetskritiska.
4. **Kaskaden gör det den är bra på** — "vem vinner"-frågor (ägandekedjan,
   tema-donuts) — och tar emot färdiga värdemängder. Donut- och
   anspråks-CSS nämner aldrig appearance.

## Avvisat, med återöppningsvillkor

Runtime-`cssText`-leveransen avvisas för denna sajt (noscript-regression,
CSP-friktion, payload per sida). Den återöppnas den dag tokens måste ändras
**utan rebuild** (t.ex. CMS-styrda teman i request-tid) — det är ett byte av
emitter, inte av författarmodell.

## Konsekvenser

- Tokeniseringspassen implementerar: fabriker per komponent, collector,
  generator (emitteras till stylesheet), resolver-utbyggnad av den portade
  `theme-preference`-kerneln från 2 till 4 lägen, FOUC-scriptet i Layout
  utökas att sätta det resolvade läget.
- `ui-tokens.css`-sömmen (ADR-0002) blir en genererad artefakt av samma källa.
- Theme-lab-sidorna behålls tills den riktiga implementationen landat, sedan
  raderas de — evidensen bor i denna ADR och i sviten.
