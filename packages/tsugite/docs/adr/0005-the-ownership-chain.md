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

## Amendment 2026-09-21 (ADR-0021)

The `--custom-*` level is live for its first property, line length: `var(--custom-<component>-lineLength, var(--_lineLength))` in Heading, Text, TextBlock and Prose. Rule 2 holds for it: the instance points at a stop's token, never writes a number.

## Amendment 2026-10-17 — the custom level live for size (seams lab)

The custom level is live for a second property family, size. Button's five
size slots (`iconSize`, `iconMargin`, `fontSize`, `paddingBlock`,
`paddingInline`) and Heading's `--_hd-fontSize` read the public level first,
in their size gates:

```css
&[data-size="sm"] {
  --_bt-fontSize: var(--custom-button-fontSize, var(--fontSize-button-small));
}
```

- **The first real need (rule 3)** is a composition turning its content's
  size in a closed range (seams lab, case 2, `/lab/seams`). Without a
  public level the turn is either lost — a slot the owner sets on itself is
  overruled by the component's own gate — or forced by reaching into the
  component's private slots and winning on specificity, which the doctrine
  forbids (§3) and which hides the exception from its owner.
- **Gate form, not consumer form.** Line length reads the custom level where
  the property is painted (`max-inline-size: var(--custom-…, var(--_…))`),
  because it has one consumer. Button reads its size slots in several places,
  so the seam sits where each slot is written. Both forms keep one fallback
  per expression (ADR-0008, amended the same day).
- **An exception is a filled custom level.** Empty, the stop answers; filled,
  someone decided, and the decision is visible by its name where it is made
  (seams lab, case 6). Whoever fills it answers for it holding.
- **Rule 2 holds, with one known gap:** an instance points at a stop's token
  (`var(--fontSize-button-large)`), never a number. The raw lengths of some
  stops (`0.8em`, `1.6em`, the icon sizes) have no token yet, so a turn to
  "the lg stop" must restate them until stops are published as pointers.
- **The component level for colour** is filled by a composition pointing the
  `--theme-*` channels at a voice's pointers (ADR-0006, amended the same
  day). No separate `--component-*` name is introduced: the channels are that
  level.

The draft that collects the discussion and the lab's measurements is
`docs/seams.md`.
