# ADR-0004: Tokengrammatik och lagersynlighet

**Status:** Accepted · 2026-08-31 · Prejudikat: `src/styles/tokens/base/grid/`

## Kontext

Craft-experimentet (källan till författarmodellen i ADR-0003) använder
dubbel-dash-grammatik (`--COLOR--B50`, `--button--color--primary`) — ett
medvetet namngivningsexperiment för att se om dubbel dash ökade läsbarheten
i långa var()-kedjor. Experimentet är utvärderat och vinner inte: det här
repots etablerade grammatik (grid, size, site, typography) behålls.
Craft låter dessutom komponenttabeller referera RAW-paletten direkt, vilket
strider mot lagerregeln nedan. Tokeniseringspassen behöver ETT svar.

## Beslut

**Grammatiken är repots etablerade — enkel dash, aldrig dubbel i mitten:**

| Lager | Form | Exempel |
|---|---|---|
| RAW (constant) | `--VERSALER-ENKEL-DASH` | `--COLOR-B50`, `--FONTSIZE-DISPLAY-1-FLOOR` |
| Semantic/tone | `--gemener-enkel-dash`, camelCase för property-ord | `--grid-container-maxWidth`, `--site-offset`, `--button-backgroundColor-primary` |
| Komponent-privat | `--_`-prefix | `--_mf-popup-bg`, `--_rs-p` |

**Lagersynlighet — primitives syns aldrig i en komponents slutstate:**

1. RAW refereras **endast** av semantiklagret. En komponents slutstate
   (computed styles, genererade block, fabriker) innehåller aldrig
   `--COLOR-*` eller andra RAW-namn.
2. Följdverkan för ADR-0003:s fabriker: **fyrlägestabellerna bor i
   semantik-/temalagrets fabriker** (där RAW-värden per läge hör hemma).
   Komponentfabriker är **lägesfria pekare** in i semantiklagret —
   `--button-backgroundColor-primary: var(--color-interactive-primary)`-form,
   utan appearance-nycklar. (= manifestets "components derive from tone".)
3. Detta krymper också den genererade CSS:en: endast semantik/teman
   dupliceras per läge; komponentpekare deklareras en gång,
   appearance-oberoende — precis som tema-donutens pekare.

## Noterat undantag

Theme-lab-tokens (`--lab-*`) refererar RAW direkt — medvetet, labbet testade
leverans, inte lager. Labbet raderas när riktiga implementationen landar
(ADR-0003).
