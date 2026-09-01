# ADR-0002: Komponentsömmen är en adapter — inte en naturalisering

**Status:** Accepted · 2026-08-31

## Kontext

De porterade referenskomponenterna läser sin design genom en söm av
tokennamn de fick med sig från biblioteket: `--ui-*` (tema: ytor, accenter,
semantiska tillstånd — bara MonthField läser 16 st) och `--SITE--PADDING`
(sidmarginal för popup-positionering, 6 läsningar). Vårt eget tokensystem
har andra namn för samma roller (t.ex. `--site-offset`, ADR-0001).

Två strategier ställdes mot varandra:

- **A — Adapter:** komponenterna behåller sömvokabulären; EN fil
  (`src/styles/ui-tokens.css`) översätter hela sömmen till vårt system.
- **B — Naturalisering:** komponenterna skrivs om att läsa vår vokabulär
  direkt; sömfilen försvinner, mappningen sprids i ~20 komponenter.

## Beslut

**A. Sömmen är en adapter.** Komponenterna fortsätter läsa `--ui-*` och
`--SITE--PADDING`; all översättning till vårt tokensystem bor i sömfilen.

Motiv:

- Hela integrationen mellan komponentvärlden och tokenarkitekturen är
  läsbar på ett ställe — sömfilen ÄR sömnaden.
- Komponenterna förblir textuellt nära referensbiblioteket: uppströms
  fixar kan plockas in med diff i stället för arkeologi.
- Det är referensbibliotekets sanktionerade konsumtionsmodell (PORTING.md:
  "one find-replace of `--ui-*` against your own tokens wires the whole
  theme").

## Öppen detalj — avgörs i tokeniseringspassen

`--SITE--PADDING`-aliaset (`--SITE--PADDING: var(--site-offset)`) skaver:
det vore renare att injicera `--site-offset` direkt i de 6 läsningarna och
slippa mellannamnet. Det är ett medvetet undantag som FÅR göras — sömmen
är kontraktet, inte varje enskilt namn — men beslutet skjuts till den
kommande fulla tokeniseringen, när målvokabulären är komplett och hela
sömfilens innehåll ändå skrivs om från neutrala defaults till riktiga
mappningar. Tills dess står aliaset kvar.

## Konsekvenser

- Färg-/tokeniseringspassen uttrycks som en omskrivning av `ui-tokens.css`
  (defaults → mappningar mot semantic/tone-lagren), inte som ändringar i
  komponentfiler.
- Konformanssviten (403 e2e, computed styles) är regressionsnätet för varje
  ändring i sömfilen.
- Nya komponenter som portas in följer samma regel: sömvokabulär i
  komponenten, översättning i sömfilen.
