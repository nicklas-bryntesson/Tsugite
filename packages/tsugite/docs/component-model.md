# Komponentmodellen — arbetsdokument

> **Design är lika mycket tillåta som blockera.**
> Grammatiken definierar vad som kan sägas; allt osägbart är skyddat.
> Samma doktrin överallt: nej-listor (namn), placeringstabeller
> (kompositioner), validateTokens (tokens), refusal rule (färgmotorn),
> kombinationsmatriser (axlar).

**Status: UTKAST / diskussionsunderlag.** Ingenting här är beslutat.
Regeln gäller: inget byggs före komplett samsyn. Dokumentet är minnet av
en pågående diskussion (startad 2026-08-31) så den kan återupptas efter
avbrott. När delar mognar till beslut flyttar de till `docs/adr/`.

---

## 1. Stoppen — granularitetsaxeln

Samma filosofi som tierstegen (ADR-0001): tydligt definierade stopp, inte
ett kontinuum. Gruppering efter vad saker ÄR — aldrig efter ursprung
(AiPoc/reference-components) eller storlek.

| Stopp | Definition | Ur nuvarande inventarie |
|---|---|---|
| **Foundations** | Tokens — ingen DOM | Färgsystemet (4 lägen × roller), typramp, tierstege, site-offset |
| **Primitives** | Äger egen vokabulär: klass + `data-*`-API, en uppgift | Heading, Prose, Button, CtaButton, Card, Picture, Notice, ToggleTip, ThemeSwitch |
| **Fields** | Primitiver under *familjekontrakt*: fälthöjd (ref-ADR-0008), `--ui`-sömmen, kernel, init-gate | ChoiceField/-Group, Picklist, RangeField/-Scale/-Group, AffixField, datumfamiljen, FileUpload |
| **Compositions** | Äger INGEN ny vokabulär — arrangemang av primitiver + tema-anspråk (ADR-0005-donuts) | Teaser, CoverComposition, mönstret-utan-namn (§6) |
| **Chrome** | Sajtens skal | Header, Footer, Layout |

**Lackmustest:** *vem äger vokabulären?* Ny CSS-vokabulär → primitiv.
Bara arrangemang + tema-anspråk → komposition. ChoiceGroup/RangeGroup/
DateTimeField är Fields (familje-interna), inte Compositions.

Beteende (JS/kernel/events) och ursprung är **metadata** per komponent,
aldrig struktur.

**Tredje pelaren — REGIONS (namngiven 2026-09-01):** MotionRegion,
ScrollArea, Reveal — wrappers som *förvaltar en förmåga och projicerar
tillstånd* (rörelse, overflow, entré). Familjenamnet låg i komponenternas
egna namn (Motion**Region**, Scroll**Area**). Ägandetestet skiljer dem:
aldrig innehåll (de HYSER innehåll), aldrig arrangemang (layout är
kontextens), målar knappt (tillståndsattribut + tvingande a11y-chrome).
ThemeSwitch är INTE en region — den är en kontroll (fältfamiljen) som
projicerar på dokumentet; regioner förvaltar sitt eget innehåll.
Kernel-källorna (motion-policy, theme-preference, visibility) är
regionernas osynliga halvor — dokumenteras med sin region eller på
kernel-hylla, aldrig egen pelare.

**Taxonomibeslut ur sink-diskussionen (2026-09-01):**
- Atomic design avvisad med precision: den klassificerar efter STORLEK
  (bryts av rekursion — Hero = Cover + innehållskluster + primitiver);
  vi klassificerar efter ÄGANDE (rekursionssäkert: varje nivå äger sitt
  arrangemang, löven äger vokabulär).
- Kontraktstiers ≠ hyllnamn: primitive/composition/region är KONTRAKT;
  docs-navens etiketter är omdöpbar manifestdata. Fields = FAMILJEBADGE
  inom primitives, inte egen tier (parkerad fråga 1 upplöst: fel ställd).
- PLATTA URL:er (/docs/button) — pelaren är en manifestkolumn, aldrig
  sökvägssegment: omklassificering utan brutna länkar.
- **/map** ersätter "Components" i headern: tre pelare (Primitives ·
  Compositions · Regions) + remsa för Foundations/Kernel (utan DOM) och
  Chrome. Kartan renderas ur docs.manifest.ts — den kan inte ljuga om
  systemet, för den ÄR systemets data.
- Tokens är INTE en pelare — de är fundamentet pelarna står på (ingen
  DOM = pelarfrågan går inte att ställa); på /map ritas Foundations +
  Kernel som grunden under pelarna. Hyllmässigt ändå toppnivå i docs-nav.
- Namnet **Foundations** (SVL:s "Base" avvisat 2026-09-01): Base kan
  inte vägra något och drar till sig grannar (resets/elementstilar/
  utilities); Tokens namnger mekanismen (ScrollObserver-fällan);
  Ground kolliderar med temarollen. Foundations blev bokstavligt i och
  med /map-metaforen — och Foundations-sidorna renderas ur fabrikerna
  med författat-vs-computed sida vid sida (visuell driftvakt, SVL:s
  "se snabbt om något gått sönder"-syfte uppgraderat).
- Stresstester som höll: Modal → Region (förvaltar exklusivitet:
  fokusfälla/inert/escape; backdrop+panel är förvaltningschrome à la
  pausknappen). Accordion → sönderfaller: Disclosure (region: avslöjar
  på begäran, data-expanded) + Accordion (composition: stapel + regeln
  "en öppen åt gången") — kompositioner arrangerar även regioner.
  Verbfamiljen "avslöjar" (Reveal/Disclosure/ToggleTip/Modal) spänner
  över pelarna = löftesaxeln och ägandeaxeln är olika axlar.
- Sinken behålls orörd som testbänk (fas 1 = noll testchurn); sviterna
  kan migreras till per-komponent-sidor i frivillig fas 2.
- Foundations-sidor renderas UR fabrikerna (import av tokens-JS) —
  driftomöjlig dokumentation, ADR-0003:s gratisgåva.

## 2. Namngivningssystemet

1. **Namnge anatomi/funktion — aldrig innehåll eller placering.**
   Testet: namnet ska överleva att innehållet varierar (bild→video),
   placeringen varierar (topp→mitt) och temat varierar.
   `Hero` föll (placering) → `Cover`. `TextWithImage` faller
   (ingredienslista — kan inte protestera när innehållet byts).

2. **Kontraktet är nej-listan.** Ett namn är värdefullt i exakt den mån
   det kan säga nej. Teaser = "transporterar till EN destination via
   länk" → formulär/varukorg/flera mål = nej. Är interaktionen en annan:
   definiera och namnge NY komponent — böj aldrig den gamla.
   `Container`/`Section`/`ContentBlock` = entropimagneter (kan inte vägra
   något, absorberar allt).

3. **Verbet först.** Varje kontrakt ska gå att skriva som en mening med
   ett verb: Teaser *transporterar* · Cover *presenterar* (innehåll PÅ
   media) · Notice *informerar* · ToggleTip *avslöjar* · Picklist
   *väljer* · FileUpload *samlar in*. Kan meningen inte skrivas är
   komponenten inte definierad än. Vägransreglerna faller ut ur verbet.

4. **Dokumentationsmallen** (per komponent): kontraktet (renderat
   slutläge, `data-*`-API) · varianter/states · **ägande** (vilka
   semantiska tokens den konsumerar, vilka `--theme-*`-slots den
   exponerar) · beteende (JS? kernel? events?) · **Vägrar** (obligatorisk
   — "det här bygger vi inte här; behöver du X är det komponent Y eller
   ett nytt mönster") · ADR-/svitpekare · ursprung (metadatarad).

5. **Fältordboken för `data-*`-axlar** (språkrevisionen 2026-09-01, efter
   Notice-kollisionen): varje attributord definieras av FRÅGAN det svarar
   på och vägrar de andra — `intent` (*vad betyder det?*) · `variant`
   (*vilken sort inom familjen?* — genre) · `emphasis` (*hur viktig bland
   syskon?* — enum, aldrig bool) · `prominence` (*hur långt från
   omgivande grund?* — sektionstier) · `size` · `theme` (*vems röst?*) ·
   `appearance` (*ljus/mörk/kontrast* — användarens/OS:ets). Nya axlar
   hämtar ord ur ordboken eller utökar den medvetet. Emphasis ≠
   prominence är PRECISION, inte splittring: en primary-knapp i en
   subtle-sektion är systemets normalfall. Inventeringen visade två
   ärvda dialekter: `data-variant` bär idag TRE fält (genre i
   Heading/Prose, intent i Notice, effekt i CtaButton) och
   `data-emphasis` TVÅ (enum-hierarki i Button, bool-intensifierare i
   Notice). Arvshantering: ref-comps-API:n är kontrakt → dialekt fryses
   som dokumenterat undantag + biblioteksfeedback (porting-log);
   AiPoc-familjen normaliseras vid verkligt behov; allt nytt talar
   ordboken.

**Öppen fråga:** ska nej-listan även exekveras i körtid (dev-guards i
kompositioner, som TagHelper-porten redan gör med ogiltiga varianter)?
Parkerad — tas med som öppen fråga i kommande taxonomi-ADR.

## 3. Kompositionsreglerna

- **Slot-huvudboken:** en komposition får bara äga *arrangemangsaxlar*.
  Slot-fyllnadens natur (bild/video), beteende (MotionRegion-policy för
  video), effekter (Backlight) och intoning (temasystemet) passerar
  genom och ägs av andra tiers. Kan något inte pekas nedåt är det en
  primitiv som saknas — inte en axel till.
- **Gränser dras mot relationer och slots — aldrig mot antal.** Antal är
  en följd av anatomin (två flanker finns; ett tredje media har ingen
  slot). Codepen OJqZwyp bevisade two-media-fallet inom samma löfte.
- **Ny komponent när, och endast när:** (a) löftet/relationen ändras
  (media slutar vara underordnad; slots börjar interagera) eller
  (b) placeringstabellen ändras. Video+bild i var sin flank = SAMMA
  komponent.
- **Axelbudget:** ~4–5 ägda axlar. Spricker den delar två mönster kostym.
- **Placeringstabeller, inte formler:** axel × axel = slutna grenar med
  explicita spann (AiPoc-manifestet: deterministic over clever). Ogiltiga
  kombinationer definieras inte — och kan då vägras i dev.
- **Testbar bokföring:** kompositionens svit testar bara arrangemang.
  Vill man skriva ett media-beteende-test i kompositionens svit har en
  kapabilitet hamnat i fel huvudbok.
- **CMS-shapen läcker inte in:** mönster tar rena props; CMS-bindning
  (Craft `{block}`, Umbraco) är ett adapterskikt utanför.

## 4. Signal/mönster-separationen (prop-for-that-analysen)

Adam Argyles prop-for-that (prop-for-that.netlify.app) = husets mönster
generaliserat: tunn JS projicerar tillstånd, CSS reagerar. Lärdomar:

- **Separera SIGNAL från MÖNSTER.** Källan (visibility → tillstånd) är
  kernel-infrastruktur; mönstret (Reveal) är en tunn konsument med
  a11y-kontrakt + effektvokabulär.
- **Projektionsytan väljs av signaltyp:** diskret/uppräknelig →
  `data-*`-attribut (selektorgrindbar, inspekterbar, testbar som
  DOM-slutläge — husstil: `data-motion`, `data-appearance`).
  Kontinuerlig (scroll-velocity, pointer-ratio, progress) → custom
  property med **livstidsprefix**: `--live-*` (uppdateras) /
  `--const-*` (latchar) — en namnaxel (livstid) som ADR-0004 saknar.
- Typed props (@property-registrering för transition på properties):
  T7-generatorn äger redan maskineriet.
- **Förbehåll:** kontinuerliga signaler alltid element-scopade (aldrig
  `:root`) · no-JS = synligt basläge, alltid · implementera egna
  kernel-källor i stället för beroendet (MotionRegion har redan
  IO-rörmokeriet).

## 5. Extraktionskandidater (diskuterade, ej beslutade)

| Kandidat | Löfte | Not |
|---|---|---|
| **Backlight** | "ger median omgivningsljus ur sitt eget innehåll" | blur-stacken foreground/blur, duplicerad i båda Craft-exemplen. `BlurImage` avvisat = teknik, inte löfte. Behöver sidans grund att glöda mot — inte på tonad yta |
| **Reveal** | "avslöjar innehåll när det kommer i vy" | MotionRegion är mallen: kernel-policy → tunn komponent → attribut → CSS lyder. Göm-grind sätts av JS, aldrig bas-CSS. Reduced motion ≠ dolt innehåll. Öppet: äger den effektvokabulär (`data-effect`)? Lutning: ja |
| **LinkGroup/ActionCluster** | "grupperar handlingar" | finns som `.link-group` (global.css) + `.linkGroup` (Craft) — redan duplicerad, alltså bevisad |
| aspect-ratio-varianterna | — | hör hemma i Picture/Media-primitiven, inte i varje komposition |
| **Disclosure** (region) + **Accordion** (komposition) | Disclosure: "avslöjar på begäran, beständigt" · Accordion: stapel + regeln "en öppen åt gången" | Kommande bygge. Facit: SVL:s produktions-accordion (sverigeslarare.se, DOM analyserad 2026-09-01) — behåll: h3-omslag runt button, aria-expanded/-controls, panel role=region labelledby TEXTSPANNET (namn utan ikonbrus), ikon som tre namngivna linjer (plus→minus i CSS), cartridge/slot = grid 0fr→1fr-klippningen, init-gate. Uppgradera: inline opacity → [data-initialized]-CSS · loading="lazy" på div är ogiltigt · .collapsed+aria-hidden → ETT tillstånd (data-expanded, allt annat projektioner) · hidden="until-found" bakom grind · medvetet nej till details/summary (heading plattas i summary) — in i Vägrar |
| **Innehållsklustret** (eyebrow/heading/prose/actions) | "presenterar ett blocks ärende" | TREDJE sightingen: SVL-demons Card + accordionBlockens blockHeader (eyebrowTitle+title) + Cover/Teaser/TextWithImage-trion. Bevisat återkommande — namnfråga öppen |
| **Bleed-skuggan** (tokenmönster, ej komponent) | "ytan blöder in i sin skugga" | Användarens kurvboll 2026-09-01, landad form: skuggan är en LOKAL FUNKTION — element passar sin egen `--_surface` som parameter till EN sanktionerad formel (`--_shadow-ink: color-mix(in oklch, var(--theme-shadow-base) 85%, var(--_surface))`). Marken (donuten) äger `--theme-shadow-base` + alfatyngd per läge (skugg-fyrlägesraderna blir röstkanal); elementet äger ytan; formeln äger blödnings-%:en. INGEN :has (kanaler ärver nedåt — donuten berättar, kortet lyssnar), inget förberäkningsspår (parametrisk = poängen). Obligatorisk @supports-grind med statisk fyrlägesskugga som fallback (Safari 15.4–16.1: IACVT i color-mix dödar hela box-shadow-listan). **T7-doktrinprecisering (ADR-kandidat):** motorn förberäknar statiska recept; runtime-color-mix är legitim EXAKT när en ingrediens är en per-element-parameter — släkt med Backlight (samma löftesfamilj: ytan blöder in i sin omgivning) |

## 6. Fallstudie: mönstret-utan-namn (f.d. TextWithImage)

**Löfte:** *presenterar prosa, flankerad av media som dekoration.*
"Dekoration" är den lastbärande klausulen — texten är subjektet.
Tre medierelationer skiljer tre mönster: PÅ media = Cover ·
BREDVID-underordnad = detta · media SOM SUBJEKT = Gallery/Figure (finns ej).

**Nej-listan:** median bär aldrig information texten saknar (ingen
lightbox/zoom/bildtext) · ingen interaktion i median (video = dekorativ
autoplay = MotionRegion-kontraktet, prejudikat: CoverCompositionVideo) ·
utan media → annat, enklare mönster · media som samling → Gallery ·
media som grund → Cover · **media bor i flankslots — det finns två.**

**Fyra ägda axlar** (slot-huvudboken — allt annat passerar genom):

| Axel | Stopp | Not |
|---|---|---|
| layout | `wide` \| `full` | baseGrid \| breakoutGrid — Block-kontraktet |
| media-sida | `start` \| `end` \| `both` | logiska sidor (RTL). `both` ⊂ `full`?, centrerar texten |
| media-ratio | `landscape` \| `portrait` \| `square` \| `golden` | ägs av SEKTIONEN: ratio × sida = placeringstabellen som styr BÅDAS spann |
| text-valign | `start` \| `center` \| `end` | — |

**Anatomi:** sektionsrot (grid-deltagande + tema-anspråk + axlar som
`data-*`) → content: Heading + Prose + ActionCluster → media:
Picture-primitiven (ratio injiceras; ev. Backlight; video via mediesöm +
MotionRegion-policy). Kompositionen äger nästan ingen vokabulär — bara
placeringstabellen och anspråken. Craft-versionen har axlarna på
sektionsnivå men INTE ratio→placeringskopplingen (spannen är konstanta
per sida) — det är förbättringen.

**ÖPPEN NAMNFRÅGA** (marineras): `Flank` föreslogs (verbet bär sida +
underordning; two-media = ordets grundbetydelse) men känns "för platt
och endimensionellt" (användarens dom 2026-08-31). `ProseWithMedia`
namnger systemets primitiver men kan inte vägra. Frön att smaka på:
namn som kodar *underordnat följe* snarare än *sida* — median är
prosans följe/eskort/omgivning. Odöpt tills vidare.

## 7. Kontrollrummet — kontrollpunkter från SVL-systemet

Förfadern (SVL-designsystemet, lokalt:
`~/Documents/Projects/Designsystem/svl-designsystem`, docs:
designsystemdocs.z1.web.core.windows.net) separerar *dokumentation*
(Base/Elements/Components/Utility/Examples) från **Testing** — ett
kontrollrum med element maps. Svar på sink-frågan: två rum, inte ett.
Konformanssviterna är kontrollrummets mekaniska tvilling; sidorna är den
mänskliga. Tre kontroller att dra in:

1. **Alignment-kontrollen** (SVL: InputAndButtonAlignment.vue) — flexrad
   med dashade stödlinjer (`border-block`), fält + knappar emellan.
   Bevakar fälthöjdskontraktet (ref-ADR-0008). Hos oss: hela fältfamiljen
   + Button-storlekarna i guide-rader, plus en e2e som asserterar att
   alla barn i en guide-rad delar block-size.
2. **Donut-scope-matrisen** (SVL: ThemeBox/ThemeVariables.vue) — samma
   kontraktsuppsättning (textroller, border, tabell, inputs × states,
   fieldset-legend, knappar × emphasis × disabled) renderad i VARJE
   temadonut sida vid sida (auto-fill-grid). Gör drift omöjlig att missa
   (bevisat: användaren såg Ter-driften i de gröna direkt). Hos oss
   multipliceras den med appearance-axeln (donuts × 4 lägen) och får en
   mekanisk tvilling SVL inte kunde ha: generatorn kontrastberäknar
   (culori, WCAG/APCA) textroller mot ytor per tema × läge vid build.
3. **NestedThemes-kontrollen** — 4 nivåers donut-i-donut med interaktiv
   temaswitch per nivå: bevisar om-scopningen på DJUPET (matrisen bevisar
   bredden).

**SVL-parallellerna i övrigt:** teman exponerar en generisk rollpalett
(`--theme--surface/--text` × primary/secondary/tertiary + defaults) som
element konsumerar direkt — vårt ADR-0005 exponerar komponentscopade
slots genom kedjan; frågan om en liten publik rollpalett hör till fråga
10. Lagerföljden 01-Setup/02-Props/03-Elements/04-Utility/05-Components
är AiPoc-manifestets anfader.

**Demo-rummet (SVL /demo, analyserad 2026-09-01 — stark buy-in från
projektägarlagret, användarens erfarenhet):** dokumenterar inte
komponenter utan SIMULERAR INSATSER. Anatomi: kontrollpanel (innehåll:
Design/Verkligheten/Hoppsan · skärmstorlek · syn m blur-filter ·
färgblindhet · fontstorlek · kontrast) → simulerad enhetsvy med RIKTIGA
komponenter (data-theme-donuts) styrda via custom properties + filter →
copy-bara kodexempel → lagankare (Lag 2023:254, EN 301 549, WCAG 1.4.4)
SIST, efter att problemet känts i händerna. Dramaturgi: beställaren
väljer "Verkligheten" + nedsatt syn + stor font och SER designen
överleva. Vår version kan vrida fler RIKTIGA axlar: appearance ×
contrast (lägen, inte filter), röst × volym, tier-stegen (FLOOR =
defensiv baseline, samma filosofi). Struktur-uppgradering av fråga 2:
inte två rum utan RUM PER PUBLIK — Docs (utvecklare, sida per
komponent) · Kontrollrum (förvaltare — #Themes redan byggd) · Demo
(beställare) · ev. tokenreferens. Mekanik att stjäla: nav genererad ur
route-metadata (title/label/preamble/published) — sidor som data med
publiceringsgrind. **Simulatorsömmen finns redan hos oss:**
`--TYPE-SCALE` (typography.constant.scss rad 1, konsumerad av varje
fontSize i semantiklagret) portades med och är demorummets testnål för
att emulera browserns fontstorleksinställning (WCAG 1.4.4) — det är
DENNA som ADR-0001:s "multipliers reserved" reserverade för; den är en
simulatorkrok, aldrig en fluid-bakdörr. Sidan är WIP uppströms men
syftet bär.

**Temanamnsvarningen (användarens, 2026-09-01):** SVL:s identitetsnamn
(björk/mossa/ek) är bundna till EN färgkartas renderingar — dark mode
var alltid en tickande bomb (användaren sköt själv ned modellen).
Preciseringen: felet är inte identitetsnamn utan namn som binder
RENDERING i stället för INVARIANT. Testet: *kan du författa temats
dark-contrast-rad utan att namnet ljuger?* Ljusblå/björk kodar ljushet →
faller; burgundy kodar kulörkaraktär → överlever; mossa = gränsfall.
Vårt system tvingar frågan strukturellt: tema = fyrlägestabell
(validateTokens), namnet namnger tabellen aldrig swatchen.
**Syntesförslag (odiskuterat klart):** två lager, RAW→semantic en våning
upp — systemet binder till ROLLER (inverse/neutral/accent/…;
theme.inverse.tokens.js är skeppat bevis: "inverse" är sant i alla fyra
lägen per konstruktion), varumärket mappar IDENTITETER på rollerna i
tilldelningsskiktet (CMS-adaptern översätter identitet→roll). Öppet:
vilka roller, hur många stopp, och varje roll måste kunna säga nej
(annars theme-1/theme-2-entropi).

## 8. Vridbarhetskravet (designprincip, användarens zoom-ut 2026-09-01)

Hela sajtuppsättningen ska kunna vridas radikalt genom att skruva på
ETT lagers tokens: bredare grid = vrid grid-konstanterna; ny palett =
vrid färgfabriken; ny typografi = dito. **Temaaxeln måste vara exakt
lika vridbar och skalbar upp/ned utan att skriva om kodbasen.**

Lagen: *vridbarhet på ett lager köps med gränssnittsstabilitet i lagret
ovanför* — konsumenter binder till namn, aldrig värden. För teman ger
det tre rattar under tre frusna gränssnitt: RAW-paletten (under
semantiska namn) · identitetens fyrlägestabell (under identitetsnamnet) ·
rolltilldelningen (under ROLLSKALAN — systemets API-version).

Asymmetrin, PRECISERAD (2026-09-01, flip/stabil-diskussionen): det
frusna gränssnittet är **SLOT-SCHEMAT** (vilka slots varje roll måste
fylla — det komponenter konsumerar via kedjan), inte roll-listan.
Komponenter binder aldrig till rollnamn. Kostnadsstege: ny SLOT = dyr
(alla roller + konsumenter berörs) · ny ROLL = datapost under styrning
(full slot-täckning i 4 lägen, validerad; skalans monotoni bevakas) ·
ny IDENTITET = fri data. Flip-vs-stabil (inverse vs vivid) är INTE
mekanism utan författningsmönster i tabellraderna — systemet klarar
båda per konstruktion, även samtidigt. **Deklarerad rollkaraktär som
byggkontrakt:** roller kan deklarera `flips`/`stable`/skal-monotoni och
motorn verifierar tabellen mot deklarationen vid build (culori +
validateTokens-disciplinen finns redan). Konsekvens för fråga 10:
`data-theme` bär roller (sluten mängd → ändliga genererade block),
aldrig identiteter (öppen mängd); identiteter finns bara som
fabriksdata + redaktörsetiketter, adaptern översätter.

Lägesbild: NED är redan byggd (ägandekedjans semantic-fallback = noll
teman fungerar), VRID är bevisad (inverse-tabellen kan skrivas om utan
komponentändringar), UPP saknar en bit: temalagret ska bli SCHEMA i
stället för specialfall — en temadefinition = en datapost (roll → slots
× 4 lägen), generatorn multiplicerar; inverseTheme görs om från
handskriven fabrik till första dataposten.

### Kedjan i praktiken — det arbetade exemplet (ursprungsfrågan besvarad)

`<section data-theme="brand" data-prominence="subtle">` →
`<article class="Teaser" data-button="true" data-media="true">` →
knappens färg:

Button ställer frågan (`--_backgroundColor:
var(--theme-button-backgroundColor-primary, var(--color-interactive-primary))`)
och äger bara VOKABULÄREN · Teaser TIGER (slot-huvudboken: data-button/
data-media är arrangemang; en färgåsikt i Teasern vore bokföringsbugg;
anspråk ärver genom den) · `[data-theme="brand"]`-blocket äger RÖSTEN
(pekar knappslotten mot brand-tabellens knappcell) ·
`[data-prominence="subtle"]` äger VOLYMEN (riktar om mot subtle-kolumnen
— knappen kontrasterar mot ljusblått, inte djupblått) · appearance ×
contrast (8 block) äger LÄGET — användarens/OS:ets domän, aldrig
sektionens · semantiska tabellen äger DEFAULTEN (svarar utanför donuts;
skala-ned-garantin) · RAW + motorn äger VÄRDENA (oklch bakom grinden,
gamut-mappad sRGB, @property-nät) · fabrikerna äger SANNINGEN.
Överskrivning: `--custom-X`, kedjans första led, vilande tills behov.
"Vem äger knappens färg?" = ingen och alla, exakt en fråga var.
Byggstatus (uppdaterad efter T8): HELA kedjan är byggd — röst-block och
prominence-pekare genereras ur `theme.voices.tokens.js` (ADR-0006
implementerad; inverse är första dataposten, Cover bär
`data-theme="inverse"`), och kontrollrummets donut-matris (#Themes i
kitchen sink) visar röster × volymer × lägen live.

## 9. Parkerade frågor

1. Fields — eget stopp eller undergrupp i Primitives?
2. Kitchen sink-strukturen: sida per komponent (C, rekommenderad —
   `targetPath()`-sömmen finns) vs per grupp (B) vs omgrupperad
   enkelsida (A)? **SVL-precedentet (§7) föreslår dessutom två rum:**
   dokumentation + kontrollrum, oavsett val av A/B/C.
3. Foundations-dokumentation (färgmatris/typramp/tierstege) i samma pass?
4. Namnet på §6-mönstret.
5. Familjemarkör för kompositioner: suffix (`*Composition`), klass
   (`Block`) eller bara foldern?
6. Anatomilexikon (Cover/…-stilen) så nya mönster namnges *ur systemet*?
7. Runtime-vägran: dev-guards som norm för kompositions-tiern?
8. Intoning tillåten vid `wide`, eller bara `full`?
9. Är `Block` namnet på Compositions-stoppets kontrakt mot sidgriden,
   eller på CMS-leveransformatet?
10. **data-theme modellerad efter prop-for-that?** (användarens kvällstanke
    2026-08-31, diskuteras härnäst) — dvs. temat som deklarativt
    attribut-API i prop-for-that-stil? Trådar att dra i: `data-props-for`-
    idiomets likhet med tema-anspråk; vad som är diskret (temanamn →
    attribut, §4-regeln) vs kontinuerligt; relationen till ADR-0003:s
    JS-författade tabeller och ADR-0005:s ägandekedja; SVL-tråden (§7):
    ska teman utöver komponentslots exponera en liten PUBLIK rollpalett
    (surface/text × primary/secondary/tertiary + defaults) som SVL:s
    `data-theme` gör — Cover:s `--theme-inverse-onMedia-text` antyder
    redan behovet?
11. **Temarollskalan** (§7:s temanamnsvarning): om systemet binder till
    roller och varumärket mappar identiteter — vilka roller, hur många
    stopp (neutral/default/accent/inverse/contrast/…?), och vad säger
    varje roll nej till? Identitetsnamn (mossa/burgundy) bor i
    tilldelningsskiktet; invariant-testet gäller även dem (burgundy ja,
    ljusblå nej). Användaren letar upp sina tidigare beslut i frågan.
    **Arbetsförslag (2026-09-01, ur konkret övning: sajt med nästan-vit
    grund + vita + ljusblå + djupblå sektioner):** axeln är AVSTÅND FRÅN
    OMGIVANDE GRUND, monoton skala med relationsstopp —
    *(frånvaro = grunden)* · `ground` (explicit återgång; behövs för
    nesting-utbrytning eftersom properties ärver) · `neutral` (lyft utan
    kulör) · `tinted` (kulör på viskningsnivå, samma polaritet) ·
    [`accent` vid behov] · `inverse` (motsatt polaritet, skeppad).
    Avvisat: "default" som roll (= frånvaron, ADR-0021) och "contrast"
    (kolliderar med kontrastaxelns lägen). ÖPPET DESIGNBESLUT: inverse
    flippar med läget — vill varumärket ha läges-stabil djupblå i dark
    behövs en femte roll (`vivid`/`brand`, läges-stabil fullkulör);
    två olika roller med samma light-rendering. UPPLÖST på systemnivå
    (§8): flip/stabil är tabellrader, inte mekanism — systemet klarar
    fyra stopp, fem stopp och båda varianterna samtidigt; valet är rent
    designbeslut per sajt, och rollens karaktär kan deklareras +
    maskinverifieras vid build.
    **STARKASTE KANDIDAT (användarens utgrävda nomenklatur, 2026-09-01):**
    `theme-surface-primary | -neutral | -subtle` — PROMINENSNAMN (hur högt
    ytan talar), byggda "utan koppling till färgnamn" = invariant-testet
    avant la lettre. Överlägsna mekanismnamnen (tinted/inverse) eftersom
    §8 lade beteendet i tabellraderna: `primary` lovar bara temats fulla
    röst — om dark-raden flippar eller står stabil är varumärkets
    tabellbeslut, namnet ljuger aldrig. Sajtmappning: grund (frånvaro) →
    vit=`neutral` → ljusblå=`subtle` → djupblå=`primary`. Att syna:
    (a) neutral är karaktärsord i intensitetsskala (COMPACT-lärdomen) —
    ordningen `ground < neutral < subtle < primary` måste dokumenteras,
    orden tvingar den inte; neutrals nej-sats (vägrar kulör) motiverar
    behållandet. (b) `ground` behövs oavsett (nesting-utbrytning).
    (c) `inverse` (skeppad, Cover) är relationell, inte prominens —
    specialroll bredvid skalan eller egentligen "primary-på-media"? Öppet.
    **EVOLUTION — TVÅAXELMODELLEN (användarens "world burn"-kast,
    2026-09-01):** `<div data-theme="brand" data-prominence="subtle">` —
    RÖST (data-theme: brand/neutral/inverse/…) × VOLYM (data-prominence:
    primary/subtle/…). Löser (a): neutral var en röst, aldrig en volym
    (blandaxeln var symptom på saknad axel). Löser (c): inverse är en
    röst; Cover = inverse × primary. Ny uttryckskraft: prominence utan
    theme = "samma röst, tystare" (nestlad volymsänkning). Mekanik:
    prominence = pekaromriktning in i röstens exponerade palett
    (theme-surface-*) — ETT block per volymstopp, ingen T×P-kombinatorik
    i CSS (multiplikationen bor i palettdatan, validerad). SVL hade
    paletten men saknade omriktaren. Husprejudikat: Button är redan
    röst × volym (data-emphasis × data-size). Kostnader: volymstopp =
    slot-schema (dyra riktningen, korrekt placerad); axelvägransregel
    krävs (en axel förtjänar existens endast om ORTOGONAL OCH TOTAL);
    heter aldrig data-tone (TONE upptaget i AiPoc-lagergrammatiken).
    **KOMBINATIONSLAGEN (användaren, 2026-09-01):** designsystemet ger
    kapabiliteter OCH blockerar otillåtna kombinationer — samma
    vägransdoktrin som guards/placeringstabeller/validateTokens/
    refusal rule, ny våning. Röst × volym-matrisen bor i temafabriken
    (EN datakälla) med TRE verkställighetsytor: generatorn (bara
    tillåtna kombinationer får block; odefinierad = förbjuden,
    whitelist/slutna grenar — inte AiPoc:s blacklist-form) · dev-guards
    (kompositionen läser samma matris, DevError i dev — detta avgör i
    praktiken parkerad fråga 7: runtime-vägran ÄR husets doktrin) ·
    kontrollrummet (matrisen renderas, förbjudna celler synligt
    förbjudna). Axelvägransregeln förfinad: totalitet är
    utgångsantagandet som håller axeln ärlig; enstaka hörn får saknas
    via matrisen, men en axel där nästan inget kombinerar är en
    förklädd enum.

