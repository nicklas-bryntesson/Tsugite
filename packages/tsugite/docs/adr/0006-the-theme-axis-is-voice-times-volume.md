# ADR-0006: Temaaxeln är två attribut — röst × volym

**Status:** Accepted · 2026-09-01

## Kontext

Sajtytor behöver intoning: sektioner som kliver olika långt från omgivande
grund (vit yta, ljus varumärkeston, full varumärkesröst). Ett första försök
med en endimensionell rollskala (`default | neutral | toned | contrast`)
sprack på tre symptom: "neutral" var ett karaktärsord i en intensitetsskala,
den skeppade `inverse`-rollen (Cover) var relationell snarare än en
intensitet, och flip-vs-stabil i dark mode såg ut att kräva två roller med
samma light-rendering. Alla tre var samma fel: en axel som bar två frågor.

Förfadern (SVL-designsystemet) exponerade per tema en palett
(`--theme--surface--primary/secondary/tertiary` + default-pekare) men
saknade en mekanism att rikta om defaulten — och dess identitetsnamn
(björk/mossa) var bundna till EN färgkartas renderingar, vilket gjorde
dark mode omöjligt utan omskrivning.

Överordnat krav (vridbarhetslagen): hela sajten ska kunna vridas radikalt
genom att skruva på ett lagers tokens. Temaaxeln måste vara lika vridbar —
och skalbar upp och ned — utan att kodbasen skrivs om.

## Beslut

Intoning uttrycks som **två ortogonala, diskreta attribut** på den yta som
gör anspråket:

```html
<section data-theme="brand" data-prominence="subtle">
```

1. **`data-theme` bär RÖSTEN** — *vems palett talar* (t.ex. `brand`,
   `neutral`, `inverse`). Värdena är **roller, aldrig identiteter**:
   varje rollnamn måste klara invariant-testet (*kan dark-contrast-raden
   författas utan att namnet ljuger?*). Varumärkesidentiteter (mossa,
   burgundy) existerar endast som fabriksdata och redaktörsetiketter;
   CMS-adaptern översätter identitet → roll. Attributet bär alltid en
   sluten mängd.
2. **`data-prominence` bär VOLYMEN** — *hur högt rösten talar* (t.ex.
   `primary`, `subtle`). Frånvaro = röstens defaultvolym. Attributet utan
   `data-theme` betyder "samma röst som omgivningen, tystare" — nestlad
   volymsänkning utan röstbyte.
3. **En röst är en fyrlägesfabrik** (ADR-0003/0004): tabellrader för
   varje slot × volym × läge, JS-författad, koverkanstestad. Generatorn
   emitterar `[data-theme="<roll>"]`-block inom de 8 appearance-blocken.
   **Volym är en pekaromriktning**: `[data-prominence="<stopp>"]`-block
   riktar om aktuell-kolumnens pekare in i röstens palett — röst-agnostiskt,
   ett block per volymstopp. Ingen röst × volym-kombinatorik i CSS;
   multiplikationen bor i palettdatan där valideringen är total.
4. **Beteende är tabellrader, inte mekanism.** Om en rösts dark-rad
   flippar polaritet (inverse-mönstret) eller står läges-stabil
   (vivid-mönstret) är ett författningsbeslut i datat. En roll får
   deklarera sin karaktär (`flips`/`stable`/skal-monotoni) och motorn
   verifierar tabellen mot deklarationen vid build (culori-maskineriet
   från T7).
5. **Det frusna gränssnittet är slot-schemat** — vilka slots varje röst
   måste fylla (ytor, textroller, komponentslots per ADR-0005) × volymer
   × fyra lägen. Kostnadsstege: ny slot = dyr (alla röster + konsumenter
   berörs) · ny röst = datapost under styrning (full täckning, validerad)
   · ny identitet = fri data.
6. **Kombinationslagen:** tillåtna röst × volym-kombinationer är en
   whitelist-matris i temafabriken — odefinierad kombination är förbjuden.
   En datakälla, tre verkställighetsytor: generatorn (endast tillåtna
   kombinationer får block) · dev-guards (kompositioner läser samma matris
   → DevError i dev, TagHelper-mönstret) · kontrollrummet (matrisen
   renderas; förbjudna celler synligt förbjudna).
7. **Konsumtionen är oförändrad** (ADR-0005): komponenter konsumerar slots
   genom den sanktionerade kedjan och känner varken röster eller volymer.
   Appearance × contrast förblir användarens/OS:ets dimension (ADR-0003)
   — en röst vet aldrig om det är natt.

## Avvisat, med återöppningsvillkor

- **En axel (`data-theme="subtle"`)** — avvisad: blandar röst och volym,
  vilket producerade alla tre symptomen i kontexten. Återöppnas inte.
- **Identiteter i attributet (`data-theme="mossa"`)** — avvisad: öppen
  mängd som växer per varumärke → CSS:en sväller med katalogen, och
  renderingsbundna namn knäcks av lägesaxeln (SVL-lärdomen). Återöppnas
  endast om attributvärdena kan genereras per sajt utan att komponenter
  eller kontrakt någonsin nämner dem.
- **`data-tone` som attributnamn** — avvisad: TONE är upptaget som
  tokenlager i AiPoc-grammatiken.
- **"contrast" som roll-/stoppnamn** — avvisad: kolliderar med
  kontrastaxelns lägen (`prefers-contrast`, light-/dark-contrast).
- **Runtime-beräknade kartor** — redan avvisat i ADR-0003; gäller även
  röst × volym.

## Avgörs vid implementation (blockerar inte beslutet)

Volymstoppens antal och namn (arbetsläge: `primary | subtle`, ordning
dokumenteras) · `ground`-rollen för nesting-utbrytning (properties ärver;
frånvaro kan inte av-ärva) · om `inverse` förblir egen röst eller visar
sig vara "primary-på-media" (Covers donut migreras då) · omfånget på den
publika rollpaletten (`--theme-surface/-text × volym`) utöver
komponentslots.

## Konsekvenser

- Temaaxeln uppfyller vridbarhetslagen: vrid = redigera fabriksdata +
  `npm run tokens`; skala ned = ta bort data (kedjans semantic-fallback
  gör axeln optional); skala upp = nya dataposter under total validering.
- `theme.inverse.tokens.js` görs om från handskriven specialfabrik till
  första dataposten i röstschemat; CoverCompositions anspråk uttrycks
  genom samma mekanism som alla andras.
- Kontrollrummet får sin donut-matris (röst × volym × 4 lägen) med
  build-tids-kontrastberäkning — drift blir rött test, inte upptäckt.
- Fleraxelidiomet (flera `data-*`-axlar per element) har husprejudikat i
  Button — men fälten är olika och orden därför medvetet skilda:
  `emphasis` ordnar syskon inbördes, `prominence` mäter avstånd till
  omgivande grund (en primary-knapp i en subtle-sektion är normalfallet,
  inte en motsägelse). Attributord väljs ur fältordboken
  (komponentmodellen §2): ett ord = en fråga.
- Nya axlar bedöms mot axelvägransregeln: en axel förtjänar existens
  endast om den är ortogonal och (i huvudsak) total — enstaka hörn får
  saknas via matrisen, men en axel där nästan inget kombinerar är en
  förklädd enum.
