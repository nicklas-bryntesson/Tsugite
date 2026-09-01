# ADR-0005: Ägandekedjan — en sanktionerad kedja, alltid samma

**Status:** Accepted · 2026-08-31

## Kontext

AiPoc-manifestet förbjuder fallback-kedjor ("Never see 4-level fallback
resolution chains") — en regel mot *ad hoc*-kedjor vars resolution ingen kan
förutsäga. Samtidigt behöver systemet ett svar på ägandefrågan: en sektion
med tema innehåller ett kort som innehåller en knapp — vem bestämmer knappens
färg? Craft-experimentet besvarade det med en fast kedja; tokeniseringspassen
har nu implementerat den.

## Beslut

**Manifestregeln amendas:** inga fallback-kedjor — *utom* ägandekedjan, som
är en enda sanktionerad form, identisk för varje egenskap i hela systemet:

```
var(--custom-X, var(--component-X, var(--theme-X, var(--<semantic-default>))))
  instansen      innehållande       tema-donuten     komponentens default
                 komponent                           (semantiklagret)
```

Regler:

1. **Första satta nivån vinner.** En nivå *gör anspråk* genom att sätta sin
   variabel; att inte sätta är att avstå.
2. **Anspråk är lägesfria pekare** (ADR-0004): en donut eller ett kort sätter
   `--theme-button-backgroundColor-primary: var(--theme-<Namn>-…)` — aldrig
   ett läges- eller RAW-värde. Appearance-dimensionen bor uteslutande i
   semantik-/temafabrikernas fyrlägestabeller.
3. **Nivåer aktiveras vid första verkliga behov.** Idag är theme-nivån
   implementerad (Button; CoverCompositions inverse-donut är första
   konsumenten). `--custom-*` och `--component-*` läggs in i kedjan när ett
   verkligt fall kräver dem — formen är redan bestämd, så det är en mekanisk
   utbyggnad, inte ett beslut.
4. **Tema-donuts är tone-lagrets projektion:** ett namngivet tema är en
   fyrlägesfabrik (`theme.<namn>.tokens.js`) plus en donut som pekar
   anspråksvariabler mot dess tokens. Hero-över-media ("inverse") är första
   temat; ljusblå sektioner m.fl. följer samma mönster.

## Implementationsnot: kontrasten bär aldrig attributet

ADR-0003 beskrev fyrvärdes-läget på attributet; implementationen förenklade:
eftersom kontrast saknar användar-override (OS-signal, ref-lib ADR-0021) är
`data-appearance ∈ {light, dark, frånvarande}` oförändrat (ThemeSwitch-
maskineriet orört, dess konformanssvit grön), och de genererade blocken
korsar attributet med `prefers-contrast`-media — 8 ömsesidigt exklusiva
block. JS bidrar bara med preferensen; kontrasten är ren CSS och fungerar
utan JavaScript.

## Konsekvenser

- Theme-lab är raderat; evidensen bor i ADR-0003 och konformanssviten.
- Gamla handskrivna `color.semantic.scss` är pensionerad (tom mixin) —
  semantiklagret genereras.
- Kvarvarande designarbete är VÄRDEN, inte struktur: dark/contrast-raderna i
  fabrikerna är mekaniska förstautkast flaggade för smakjustering.
