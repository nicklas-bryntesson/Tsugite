# ADR-0001: Viewport-nivåerna är en global axel med fasta pinnar

**Status:** Accepted · 2026-08-31

## Kontext

Dimensionsramperna i tokensystemet hade tre olika svar på samma fråga
("vad händer med det här värdet när viewporten ändras?"):

- `FONTSIZE-*` växlade MOBILE/DESKTOP vid 48.75rem
- `SIZE-*` (spacing) växlade MOBILE/DESKTOP vid 48.75rem
- `SITE-OFFSET-*` växlade MOBILE/**TABLET**/DESKTOP vid egna trösklar
  (25/90rem), där TABLET var ett fluid `clamp()`-värde

Dessutom saknade alla ramper ett svar för mycket små viewports: display-1 på
3.5rem tog fyra rader på en 320px-skärm, och hero-knapparna var
oproportionerligt stora. Projektägaren har uttryckligen valt **tydligt
definierade stopp framför fluid skalning** — fluid på ett ställe tvingar hela
systemet att bli fluid, och manifestets grundprincip är *deterministic over
clever, closed branches over cascading fallbacks*.

## Beslut

Viewport-nivån är en **global axel** med fast vokabulär och fasta trösklar.
Varje dimensionsramp definierar ett explicit värde för varje nivå.

| Nivå | Intervall | Syfte |
|---|---|---|
| `FLOOR` | ≤ 21.24999rem | Golvet — skalan som måste hålla när utrymmet tar slut. Defensiv till syftet, aldrig till mekaniken |
| `MOBILE` | 21.25 – 48.74rem | Smala skärmar |
| `DESKTOP` | 48.75 – 89.99rem | Normala skärmar |
| `WIDE` | ≥ 90rem | Stora skärmar — där ytterligare tillväxt är ett aktivt val |

Regler:

1. **Grammatiken är `{TOKEN}-{TIER}`** (`--FONTSIZE-DISPLAY-1-FLOOR`).
   Nivånamn får inte kollidera med andra axlars vokabulär — `COMPACT`
   förkastades för att compact är ett densitetsord, `SMALL` för att det är
   ett storleksvariantord (`BODY-SMALL`), `BASE`/`BASELINE` för kollision med
   basskiktet och `--baseline-offset-*`.
2. **Semantiklagret växlar i avgränsade intervall** (`min-width` OCH
   `max-width`) — inspektorn visar exakt en aktiv regel per token. Aldrig
   bas-värde-som-överskuggas.
3. **Explicit över DRY:** en nivå vars värden råkar vara lika med grannens
   deklareras ändå (`FONTSIZE-*-WIDE` = DESKTOP-värdena, utskrivet). Att
   inget växer är ett beslut, inte en utelämning.
4. **Fluid (`clamp()`, vw-matematik) är förbjuden i ramperna.** Fasta stopp.
5. **Multiplikatorerna `--TYPE-SCALE`/`--SPACE-SCALE` är reserverade krokar**
   (t.ex. användarpreferens) och får inte användas som breakpoint-mekanik.
6. **21.25rem-tröskeln är delad med kompositionslagret** — CoverComposition
   växlar stacked/overlay på samma gräns. En brytpunkt, inte två.

## Utanför scope

**Layout-gridens kolumnstege** (1/4/8/12 kolumner vid 40/48/80rem, inkl.
`GRID-GAP-*`) är layout-*topologi*, inte dimensionsskala — layoutaxeln äger
sina egna brytpunkter (jfr manifestets axelseparation). Den ska inte tvingas
in på den här stegen, och den här stegen ska inte ärva dess trösklar.

## Konsekvenser

- `SITE-OFFSET` mappades om till stegen med stoppen 16/24/48/80px; det fluida
  TABLET-värdet togs bort. Sidmarginalerna i spannet 780–1440px blev något
  stramare än clamp-kurvan; ≥ 90rem är oförändrat.
- `SIZE-*` fick FLOOR (2/4/10/16/20/24/28/32/36px — hela rampen komprimerad)
  och WIDE (= DESKTOP, explicit).
- `FONTSIZE-*` fick FLOOR (bl.a. display-1 2.25rem) och WIDE (= DESKTOP).
- Komponenter behöver inte röras: em-baserade komponenter (Button, ChoiceField,
  RangeField) följer rampen automatiskt — det är designens bevis.
- Ref-komponenternas `--SITE--PADDING`-söm aliaseras till `--site-offset`.
