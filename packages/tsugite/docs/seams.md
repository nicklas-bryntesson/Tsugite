# Seams — where the system can be turned

**Status: DRAFT.** This is the memory of an ongoing discussion, like
`component-model.md`. Nothing here is decided. Settled parts move to the
ADR ledger, and nothing is built on this file without explicit sign-off.

## Why this file exists

A rigid system still needs seams. Someone will one day say: *the design
system says this, but this button, only here, is different.* The system
must have a place for that answer that is not a hack. It must also have a
place for the *designed* exceptions: a component that turns its children
when it changes shape, such as a Cover over a breakpoint or a Teaser
lying down.

Getting these seams right is both fragile and vital. A seam in the wrong
place either leaks (one claim reaches what it should not) or is
unreachable (the turn cannot be made at all). This file collects what has
been found so far.

## The principle (thought, not decided)

**The system is a whitelist.** What exists in the system is allowed and
needs no justification. Everything that does not exist in it is an
exception, and an exception is someone's override decision. A design
system *gives* capabilities as much as it *forbids* what the brand
guidelines do not allow.

**An exception is a filled `custom` level in the resolve chain.** Empty:
the system answers. Filled: someone decided. This makes an exception
mechanical and measurable.

What follows from it:
- **The custom level is public.** `--_` is the prefix for private slots,
  which cannot be filled from outside (fact 5). To be fillable, the level
  is `--custom-*`.
- **An exception has a visible owner.** A composition (a turn) or an
  instance, never anonymous CSS somewhere. AiPoc's `.Hero` was an exception
  without a visible owner, and the port lost it without anyone noticing.
- **An exception is visible.** Debug mode can mark every element where a
  custom level resolves, so it shows where the system was overridden and by
  whom.
- **The system's own answers need no override.** A card at a volume
  within its ground's voice is the system. A brown card on blue is an
  exception someone owns.
- **Responsibility follows ownership.** The system checks its own answers
  exhaustively (every voice, volume and mode, contrast tested at build).
  It cannot check every combination its seams make possible, and does not
  try. Whoever decides that an exception should exist answers for it
  holding, contrast included. The system's duty towards exceptions is to
  make them visible (lab case 6: a filled custom level shows by its name),
  not to validate them.

Open: in Craft, `--component` was the *system's* designed coupling (a card
telling its buttons what they are inside it) and `--custom` was the
override. A composition's turn (Cover above its point) has been called an
exception the composition owns. Does Cover then write `--custom`, leaving
`--component` for the system's own, generated couplings? Or is a turn a
`--component` fill?

## Ownership of colour in nestings (thought, not decided)

Today Home can nest freely:

```
section: Surface brand/primary
  Card → Surface neutral/subtle
  Card → Surface brand/subtle
```

The structure works. Only the inner Surface cannot pass its tone up to the
Card's shadow (fact 1). But it raises the ownership question: may the card
decide what it is in every context? May a card on brand/primary be any
colour, or only as an exception? A brand guideline would have strong
opinions about a brown card on a bright blue ground.

**Giving components a Surface capability (a voice claim prop).**
- *Gains:* one element; Card reads its own ground and its shadow reaches
  it; no Surface inside the card; buttons and text inside follow, because
  the channels are published on the component (fact 3).
- *Costs:*
  - every claim is a voice boundary: every channel is rewritten on the
    element, and what was inherited from the base (the shadow tint, or
    anything a composition turned above) is lost;
  - the vocabulary spreads: Surface stops being the only door (ADR-0016),
    the guard moves to the kernel or is copied — close to "theme on
    everything";
  - Surface splits: today it is claim, ground and rhythm in one; a claiming
    component takes the first two but not the rhythm;
  - static claims tempt: Cover's static `data-theme="inverse"` was a static
    prop where the answer depended on context;
  - the test matrix grows: components × voices × volumes × modes.
- *If at all:* the capability is "paints a ground of its own", not "can be
  themed". Only components that are a ground may claim (Card, Teaser, the
  modal sheet); Button and Heading never. Open: which components are a
  ground today?

**A nesting matrix.** The combination law (ADR-0006 §6) says which voice ×
volume exist. Nothing says which voices may stand on which ground. A
nesting matrix authored by the brand, as data like `voiceMatrix`, would
(for example, a brand/primary ground bears only brand/subtle or neutral).
- Default: the card chooses nothing. It takes the ground it lies on, and
  the voice says what a card is inside it (like the Craft card's secondary
  ground): the brand's answer, not the card's.
- Deviations only as composition-owned exceptions, inside the matrix.
- Catch: an Astro component cannot see its ancestors, so DevError cannot
  catch a forbidden nesting at render. The check lives elsewhere: dev CSS
  that marks a wrong nesting in debug mode, or a test over the rendered
  page.
- Open: brand data in the theme next to `voiceMatrix`, or a system rule the
  brand cannot change?

**A prominence axis on Card, without a voice.** Surface already means
"prominence without voice = the surrounding voice, at this volume". On
Card:
- Card without prominence: the ground it lies on, through the default
  chain (tbd).
- Card with prominence: the same voice at another volume. It stands out,
  but only inside the section's voice.

Surface (the ground) still owns the colour axis, the voice; the card owns
only the volume inside it. The brown card cannot exist because the card has
no voice to choose: brand-safe by construction. The shadow also resolves
better: card and base share a voice, so the tone agrees.
- Catch: volumes are **absolute** cells. A `subtle` card on a brand/subtle
  section is the same colour as the ground and does not stand out.
  Inverse has only primary.
- Open: is a card's prominence absolute (a cell) or relative ("one step
  from the ground I stand on")?

## Transparency inside a component (lab case 3)

A frame inside a card, made of 10% of an ink: a way to set something apart
inside a component without a voice of its own. (Prior art: Sveriges
Lärare's near-black text colour in two transparent steps, about 6% and
12%, for nested menu levels and boxes in cards.) Measured on brand,
neutral and accent subtle, and on brand primary, in light and dark:

- **A transparent frame goes towards the text of the ground it lies on.**
  Text always contrasts with its ground, so its direction is always right:
  the frame sinks on a light ground and lifts on a dark one, in every mode,
  with no rule of its own. The ink is the voice's text (`--theme-text`),
  never the global layer: `--color-text-primary` is the *page's* text, and
  on a dark card (brand primary, light mode) it sinks the frame into the
  ground until it nearly disappears. The voice's ink lifts it.
- **Direction is solved; hue is not.** In light mode the three subtle
  voices share the same near-black text, so the voice's ink and the global
  ink are the same colour there. On beige the frame turns warm and fine; on
  light blue it turns a muddy blue-grey. The text ink gives the right
  direction, not the right hue on coloured light grounds. That would need
  an ink with the voice's own hue.
- **Contrast holds at 10%:** text in the frame measured 7.66–15.73 : 1.
- **Where it lives:** a role per voice cell (alpha steps of the voice's
  ink), built by the factory in all four modes, with the sRGB fallback
  computed like every other colour. No runtime `color-mix`: the floor
  (Chrome 109) lacks it. The lab mixes at runtime only to measure.
- **Open:** the hue question; stacking depth (the build's WCAG check does
  not know how deep layers stack — a depth cap, or the worst case
  checked); and whether the contrast modes replace transparency with a
  border.

## The ground as a snapshot (lab case 7)

Open question 12 asked how a claimed card's shadow can read the base it
falls on, when the claim rewrites every `--theme-*` channel on the card.
The lab answers it without a `parentTheme` prop (Craft's cost):

**`var()` is resolved on the element where the custom property is
declared, and children inherit the finished value, not the expression.**

1. The section (Surface, neutral · subtle) has its voice: there,
   `--theme-surface` is neutral subtle's ground.
2. The section declares `--lab-ground-surface: var(--theme-surface)`. The
   browser resolves the `var()` right there and keeps the result,
   `oklch(0.985 0.004 74)`. From then on it is a colour, not a reference.
3. The card inherits that finished colour.
4. The card's own claim (`data-theme="brand"`) rewrites `--theme-surface`
   on the card, but nothing rewrites `--lab-ground-surface`. It stays the
   ground's colour.
5. The card's shadow reads `--lab-ground-surface` and takes the ground's
   tone.

A snapshot of the ground: the section takes the picture and passes it
down; a claim can repaint itself but not the picture. (Had the card
declared the name itself, the picture would have been taken on the card,
showing its own colour.)

Measured: a brand and an accent card on neutral · subtle, four ways —
black (today), tinted by the card's voice, tinted by the ground, and both
(a ground-tinted shadow plus a card-tinted glow: Craft's two layers).

**Built (ADR-0006 and ADR-0016 amendments):** Surface publishes
`--ground-shadow` and `--ground-shadow-soft`, the inks the shadow factory
precomputes from each voice cell's surface and the recipe in
`theme-default/shadow.tokens.js`; Card's elevation reads them, with the page's
ink as fallback. The glow (the card's own tint) is not built.

**As first described:** whoever paints a
ground (Surface) always publishes it under a name of its own, e.g.
`--ground-surface`. Anything lying on the ground reads it, claimed or not.
In nested grounds the nearest painter wins, so a shadow always reads the
ground directly beneath it. The shadow colours themselves would be
precomputed by the factory (the lab mixes them with relative colour,
which the floor lacks).

### The pressure of the tint, per mode

Dark mode amplifies a coloured glow: on a dark ground it reads as coloured
light, so the same mix that is gentle in light mode is loud in dark (seen
on the accent card). The shadow formula already has the knobs — lightness,
chroma and alpha — hard-coded in the lab (`calc(l * .45) c h / .4`). They
become tokens authored per mode, like every colour in the four-mode table:

```css
oklch(from var(--theme-surface)
      calc(l * var(--shadowTint-lightness))
      calc(c * var(--shadowTint-chroma))
      h / var(--shadowTint-alpha))
```

- **A global recipe in the theme** (theme-default): three knobs × four
  modes, twelve values. For example chroma 1 in light, 0.5 in dark, 0 in
  both contrast modes.
- **An optional override per voice** (decided: per voice is enough, not
  per voice × volume): `accent: { shadowTint: { chroma: t(…) } }`. The
  factory takes the voice's value where it exists, otherwise the global
  one — the same pattern as a voice's optional stop (ADR-0012 law b), not a
  new kind of thing. "Make the brown less intense" becomes a row in
  accent's table, not a hack in CSS.
- **Applied at build.** The factory precomputes the shadow colour per voice
  cell and mode (the floor lacks relative colour), so an override costs
  nothing at runtime: no new seam, no channel, no longer chain. The cost is
  stewardship — every override is a value someone tunes in four modes.

## A card in a modal (lab case 8)

- **Today the card is see-through.** Card paints no ground and the modal is
  a transparent layer: background `rgba(0, 0, 0, 0)` over the backdrop.
- **Direction A holds.** With `var(--theme-surface, var(--color-surface-page))`
  painted on the card, a modal opened from the page takes the page surface.
- **A modal takes the voice of where it stands in the markup, not of where
  it shows.** The same card in a modal placed inside a brand · primary
  Surface turns brand blue. The top layer detaches the dialog visually;
  inheritance still follows the DOM. Where a modal is written decides its
  colour. Open: is that a feature (a modal speaks its section's voice) or a
  trap (a modal written in a dark band looks foreign over a light page)?

## A card's volume: absolute or relative (lab case 9)

A card that stands out only inside its ground's voice, on neutral · subtle,
brand · subtle, brand · primary and inverse. Edge contrast against the
ground, light mode (dark in brackets):

- **Absolute** (the card asks for subtle): 1.00, 1.00, 13.65, 19.21
  (1.00, 1.00, 1.86, 1.07). Invisible on its own volume; inverse has no
  subtle and falls back to the page surface.
- **Relative, the other volume of the voice** (the cells are inherited from
  the ground's voice block): 1.05, 13.65, 13.65, 19.21 (1.19, 1.86, 1.86,
  1.07). Either almost nothing (neutral) or a whole volume flip (a dark
  card on light). Never "stands out a little"; inverse has no second
  volume.
- **Relative, one step of the voice's ink** (10% of `--theme-text`, case 3):
  1.25, 1.25, 1.35, 1.28 (1.33, 1.27, 1.32, 1.22). **The only one that
  gives an even, small step on every ground and in both modes.**

The answer to open question 11 leans to relative, through the voice's
ink rather than the other cell. Case 3's hue question comes with it.

(The 3:1 edge rule of WCAG 1.4.11 binds a control's boundary; a card's
edge is reported, not judged.)

## Facts (verified)

1. **Custom properties inherit downward only.** A value resolved *inside*
   a component cannot reach the component's own CSS. On Home, the cards
   are `Card → Surface → content`. The voice is claimed by the inner
   Surface, so the Card's shadow and border can never read that ground.
   If a shadow is to be tinted by the card's surface, the colour must be
   resolved on the Card or above it.

2. **An attribute cannot change inside a media or container query.**
   `data-theme`, `data-size` and every other axis attribute hold in every
   range. The only things a range can turn are variables, or gates that
   were generated per range.

3. **The voice engine is element-agnostic.**
   `color.themes.generated.css` selects `[data-theme]` and
   `[data-prominence]` on any element and publishes `--theme-surface`,
   `--theme-text`, the button channels and so on there. Surface adds two
   things: it paints `--theme-surface` and owns the rhythm.

4. **Voice cells are only addressable under their selector.** The cells
   are published inside `[data-theme="<voice>"]` blocks. Nothing points at
   "inverse text" outside that attribute, so CSS cannot claim a voice from
   inside a query.

5. **Private slots beat inherited values.** A component's `--_*` slots
   are set on the element itself, in its gates (for example
   `&[data-size="sm"] { --_bt-fontSize: … }`). A parent that sets the same
   name loses. A parent can only turn a slot that reads a *public* level.

6. **The ownership chain was decided but only half built.** ADR-0005
   decided `custom → component → theme → semantic` (instance, containing
   component, voice, default). Rule 3 deferred the custom and component
   levels to "the first real need". The history of both Tsugite and
   AstroRefComp shows Button never had them; it has only the theme seam
   `var(--theme-button-…, var(--color-…))`. `--custom-*` is live for one
   property, line length (ADR-0005 amendment, ADR-0021). The original
   Button, before AiPoc, had all four levels (see *Prior art*). The chain
   was lost in the port, before this lineage's history begins.

7. **ADR-0008 constrains how the chain is written.** It allows at most one
   fallback per expression, at a seam. The ADR-0005 notation is a nested
   four-level chain. Built today, each level must be its own declaration
   with one seam each.

8. **Cover was flattened to "an inverse component".**
   `data-theme="inverse"` has been static on `.content-container` since
   upstream T8 (AstroRefComp `1b89a9a`). The STACKED and OVERLAY
   breakpoint blocks inside `.content` were already empty when the
   component arrived. The flip lived in AiPoc's site stylesheet on `.Hero`,
   not in the component (see *Prior art*), so it was never ported. The
   empty blocks were removed in `2e2639c`. Result: in a narrow container
   (STACKED, ≤ 21.25rem) the content sits on the light page with inverse
   ink — light text and buttons on a light ground.

9. **Card paints no ground.** Its CSS owns border, radius, clipping,
   padding and elevation, and no background. Inside the transparent modal
   (ADR-0029) there is no ground under it, so the docs examples put a
   Surface inside a Card (`padding="none"`). Surface's padding is sized
   for a band, which is too much for a card.

## Cases

- **Modal content.** A Card in a modal stands on nothing.
- **Card shadow tinted by the card's surface.** Needs the ground resolved
  on the Card (fact 1).
- **A card on a dark section.** Unconfigured, it must not turn light.
- **Cover over a breakpoint.** Default text and buttons are the base. Above
  the point where the content lies over the media, the whole chain turns:
  text, buttons in every state, borders.
- **Button md on mobile, lg on large screens.**
- **Teaser lying down.** Button `sm` and Heading `data-size="4"` are too
  small in the horizontal layout. This is a variable turn inside a
  container-query range.
- **This one button, only here.** The instance override.

## Directions on the table (none decided)

- **A. Card's default ground is the ground it stands on.** The default is
  `var(--theme-surface, var(--color-surface-page))`, resolved on the Card
  into its own slot (`--_cd-backgroundColor`), which the shadow can then
  read. In a modal it falls to the page surface. On a dark section it
  takes the section's ground, and border and shadow set it apart.

- **B. Card carries the voice claim itself.**
  `<Card theme="brand" prominence="primary">` uses the same axis, matrix
  and DevError as Surface (ADR-0006). With A, the same read covers the
  claimed and the unclaimed card: on a claimed Card, `--theme-surface` is
  its own voice. Open question: is the claim a kernel-level contract that
  any root may carry, or a guard each component copies? The first
  amends ADR-0016, because Surface stops being the only door.

- **C. `--custom-*` exists on every slot from the start.** This amends
  ADR-0005 rule 3: a seam whose need is known in advance cannot wait for
  its first case, because the first case comes from someone who may not
  touch the system. Rule 3 keeps governing the other levels, or not (open).

- **D. A `--component-*` level that a containing component sets.** The
  gate reads the public level with its own stop as the fallback:

  ```css
  &[data-size="sm"] {
    --_bt-fontSize: var(--component-button-fontSize, var(--fontSize-button));
  }
  ```

  The Teaser sets `--component-button-fontSize: var(--fontSize-button-large)`
  inside its range. Under ADR-0008, custom → component → stop are separate
  declarations with one seam each. Costs:
  - *It leaks downward.* Everything below inherits it. That is bounded if a
    composition never contains another composition (see constraints).
  - *It turns properties, not stops.* Turning to "lg" means pointing
    fontSize, padding, iconSize and iconMargin one by one, unless every
    stop is published as a token group that can be pointed at in one go.

- **E. Axis values per range — REJECTED.** For example
  `size={{ base: "sm", wide: "md" }}` generating gates per range. Rejected
  because it is Tailwind as data props (see *The ground question*).

- **F. Voice cells published as addressable pointers.** A component could
  then claim a voice from CSS inside a query (Cover above its breakpoint),
  which is the `--component-*` level for colour. This needs a schema and
  generator change, and an ADR.

- **Cover, short term.** Either the STACKED branch paints the inverse
  ground (`var(--theme-surface, …)`, consistent with "the scrim is its
  ground"), or Cover turns from default to inverse above the point (needs
  D/F). The discussion leans to the second: default is the base.

## The ground question

How can a system whose props are set in HTML turn its capabilities in
contexts that HTML knows nothing about?

The worst case: a button that changes colour *and* size within a media
range. Below 340px it is `sm` in the global theme's default colour. Above
340px it is `lg` and white, whatever the global theme says.

**Rejected: per-range props in markup.** Props such as
`size={{ base: "sm", wide: "lg" }}`, which generate per-range gates
(`data-size-wide`), are Tailwind written as data attributes. Direction E
falls with this.

**Direction (leaning, not decided): the context owner turns.** The element
knows nothing and carries only its default props. HTML carries identity
(what I am, where I stand), CSS carries context. The owner of the context
turns its children in its own CSS, inside its own range, through the
chain's public levels:

```css
@media (min-width: 340px) {
  .Hero {
    --component-button-…: <the lg stop>;
    --component-button-…: <white>;
  }
}
```

**Only a composition may turn.** Turning lives in a composition, which
owns its ranges. Free author CSS on a page does not turn components. The
`--custom-*` instance seam (C) is a separate question.

**Every turn is an exception, and the composition owns it.** The baseline
is the state in which the composition makes no claim: its content stands
on the ground around it, and the global theme answers.

**The exception is where the composition creates a ground of its own —
not where the traffic is smaller.** Cover as the worked case:
- *Below 340px* the content stands on the page's ground. Cover creates no
  ground and makes no claim: default text, default buttons, the global
  theme. This is the baseline.
- *Above 340px* the content stands on the scrim, a ground Cover creates
  itself. Whoever creates a ground must claim it: light text and light
  buttons in every state, whatever the global theme. This is the
  exception, and Cover owns it.

One could argue that the narrow range is the exception because few
visitors reach it. Frequency does not decide; the ground does. Technically
the range above 340px is the exception.

**Size follows the same rule.** A button or a heading that grows when
there is more room: the baseline is what works *everywhere*, in the least
space. This is defensive design and progressive enhancement. The larger
size is the exception, where the composition creates room and lets its
content take it.

So colour and size share one criterion: **the exception is where the
composition creates a condition the baseline does not assume** — a ground
of its own, or more room.

**This is not the forbidden reflex.** The doctrine forbids a
"mobile-first base + progressive overrides" (css-doctrine §3). A turn is
something else only while it stays narrow:
- one composition makes the claim, for its own content;
- the claim lives in one closed range;
- it is not a cascade of breakpoints through the system, and a component's
  own CSS never does it.

Without this boundary written down, the next reader takes it to mean the
reflex is allowed again.

What the system must provide for this to work:
- every slot reads a public level that can be turned (D);
- there is something to point at: stops and voice cells published as
  pointers (D's token groups, F).

## Prior art — what the predecessors did

Two predecessors already had working answers to parts of this. They are
players in the discussion, not templates.

### The original Button (pre-AiPoc Astro component)

1. **The full four-level chain, literally.** Every colour property, per
   type, resolved in one expression, with the control flow written as a
   comment ("1. custom → 2. component → 3. theme → 4. default"):
   ```css
   &[data-type="primary"] {
     background-color: var(--custom--button--backgroundColor--primary,
                       var(--component--button--backgroundColor--primary,
                       var(--theme--button--backgroundColor--primary,
                       var(--button--backgroundColor--primary))));
   }
   ```
2. **The chain sat on the final property, in the gate.** The public levels
   are read where the colour is painted, so values inherited from an
   ancestor (a composition's `--component--*`, an instance's `--custom--*`)
   reach it. Fact 5's problem did not exist there: no private slot stood in
   between.
3. **Only colour was seamed.** Sizes were private `--_*` slots per size
   gate, with no public level. Turning size has never had a seam, not even
   in the origin.
4. **`:where(.button)`** puts the whole component at zero specificity. Any
   author selector wins, which is a seam by specificity, not by variables.
5. **Variable grammar:** `--<level>--<component>--<property>--<variant>`,
   one double-dash per segment.

### The Craft Card (`craft-astro-tailwind`, `Card.astro` + `Card.token.assignments.css`)

1. **Two files: assignments and mechanics.** `Card.token.assignments.css`
   only decides *which token fills which slot*, per theme. `Card.astro`'s
   CSS only reads `--_*` slots (structure, gates, border, elevation). The
   resolve is a file of its own.
2. **An unthemed card follows its context.** The base `.Card` points its
   slots at generic context channels: `--_backgroundColor:
   var(--theme--backgroundColor--secondary)`, plus the primary and
   secondary colour and the border. The card's default ground is the
   voice's *secondary* ground: authored by the voice, not page and not
   derived.
3. **Named voice tokens, addressable outside the selector.**
   `.Card[data-theme="TutuPink"]` points its slots at
   `--theme--TutuPink--…`. Each voice existed as global, named pointers. The
   gap in fact 4 did not exist there.
4. **Card was a `--component--*` claimant.** A themed card sets
   `--component--button--backgroundColor--primary` (and border and colour)
   for the buttons inside it. This is direction D for colour, working.
5. **The shadow is tinted by the ground it falls on; the card's colour is a
   glow.** Shadow tokens are precomputed per *background* voice ×
   elevation × mode (`shadow-combinations.tokens.js`, Josh Comeau style,
   `none` in the contrast modes). The card's own colour bleeds through a
   `::after` glow painted with `--_backgroundColor`, offset and scaled down
   behind the card. This answers "card's voice or base's voice?" with
   *both, as two separate layers*.
6. **The cost: `parentTheme` as a prop.** To pick the background shadow the
   markup had to name the parent's theme, so HTML knew its context. This
   goes against "HTML carries identity, CSS carries context".
7. **`filled` true/false.** A card could be transparent, a frame only.
8. **Public defaults on the root.** `--card--padding`, `--card--gap`,
   `--card--borderRadius--outer/inner` sit on `:where(.Card)` as knobs a
   theme can turn.

### The AiPoc Hero (`AiPoc.Web/ClientApp/css/style.css`, `.Hero`)

This is where Cover's flip actually lived, and why it was lost.

1. **The flip lived in the site stylesheet, not in the component.**
   `CoverComposition.css` held only the empty breakpoint blocks. The turn
   was written on `.Hero`, the page's wrapper around the composition. The
   port took the component and left the page CSS behind, so the flip
   disappeared (fact 8).
2. **It wrote into Button's private slots from outside.**
   `.Hero .content :where(.Button)[data-emphasis="primary"]` set
   `--_color`, `--_backgroundColor` and `--_borderColor`. That worked only
   because Button's own gates were zero-specificity (`:where`): the outside
   selector won. It is the seam-by-specificity from the original Button,
   used against private names.
3. **Every state was written out.** Base, `:hover`, `:active` and
   `:focus-visible`, each with colour, background and border, for primary
   and secondary. A turn of "the button's colour" is in practice a turn of
   the whole state table.
4. **"White regardless of theme" was RAW values.** `var(--COLOR-N00)`,
   `--COLOR-N80`, `--COLOR-B05` and so on, plus a literal `color: white` on
   Heading and Prose. Mode-independence came from skipping the semantic and
   theme layers entirely.
5. **The range was open and on the viewport.** `@media (min-width:
   21.25rem)`, while Cover's own layout switches on a container query at
   the same value. The turn and the layout could disagree in a narrow
   container on a wide screen.

What the Hero confirms: the turn is a composition's exception above a
point (*The ground question*). What it warns against: the turn must live
in the composition itself, go through public levels rather than private
slots, point at something other than RAW, and use the same query as the
layout it follows.

### What this adds to the open questions

- **On a claimed card, the ground below is lost.** If Card carries
  `data-theme`, the voice block republishes every channel on the Card
  itself, so a channel inherited from the base (its shadow tint) is
  overwritten on the same element. Craft worked around it with
  `parentTheme`. Tsugite needs another way for the base's shadow to reach
  a claimed card: a channel that only the ground's painter publishes, read
  under its own name. Open.
- **Assignments as a file of their own** fits recipe-as-data (ADR-0018):
  the resolve table could be data, generated, while the component CSS only
  reads slots.

## Plan

### 1. A lab page with the cases

Before any ADR, a lab page that renders the cases side by side and lets
each one be inspected live. These are complex questions, and the answers
must be shown, not argued. The page holds three families:

- **Exceptions.** One instance turned, only here (`--custom-*`).
- **Turns.** A composition turns its content in a closed range: Cover's
  colour above its point (the whole state table, text, buttons and
  borders), Teaser lying down (Button and Heading size), the worst-case
  button (colour *and* size in one range, white regardless of the global
  theme).
- **Nestings.** Section `neutral/subtle` holding a `brand/primary` and an
  `accent/primary` card with tinted shadows. A card in a modal with no
  ground. A card on a dark section. A claimed card whose shadow must
  still read the base it falls on.

For every case the lab must answer **how** it has to look, and **what can
be rendered by JS (build time) and what by CSS (runtime)**.

**The lab grows out of `/docs/surface`.** That page (the
`fixtures/SurfaceSection.astro` fixture) shows three things today: voice ×
volume (brand primary/subtle, inverse), adjacency (equal neighbours are
one ground), and one volume-only nesting (brand/primary holding a subtle
Surface). Each is one level deep, with Surface as the only player. The lab
takes it further:
- **deeper nestings:** voice in voice, volume in volume, three levels,
  inverse inside brand, the combinations the matrix forbids;
- **other players on the grounds:** Card (with and without volume, with
  shadow), Button in every state, Heading and Text, Notice, Teaser, a modal
  sheet;
- **the turns and exceptions:** Cover over its point, Teaser lying down,
  the worst-case button, a filled `--custom-*` made visible in debug mode;
- **every case in all four modes** (light, dark and both contrast modes),
  because a seam that holds in one mode can break in another.

**The first case: Home's three coloured cards.** `Card → Surface (voice,
subtle) → content`, three voices side by side. It already holds most of
the questions: the ground living inside the card, the shadow that cannot
reach it, the volume inside a voice, and who decided the colour.

**What the lab is for, beyond the answers:**
- **Keep an eye on every cable.** Each case shows which levels, channels
  and slots it reads and where each one was filled, so that no coupling
  stays hidden.
- **Bring all the complexity into the light** before anything is decided.
- **Combinatorial explosions are allowed — if the machine maintains them.**
  Voices × volumes × modes × nestings × components × states × ranges grows
  fast, and that is fine when it is generated. The colour resolve scales
  are the type example: an explosion that is entirely acceptable. Moving
  targets like colour *will* be complex. What is not allowed is
  hand-maintained complexity: managing it manually always means hidden
  debt and drift. For every mechanism the lab records what it multiplies
  by, and whether a machine or a hand holds it. An explosion held by hand
  is the thing to remove.
- **Decide the split.** Which part of the CSS the machine maintains (the
  resolve maps, voice cells, generated gates), and which part is written
  by hand (mechanics, structure, layout). The line is drawn per mechanism,
  from what the lab shows.

### 2. Mechanics by hand, the resolve map by machine

This direction follows the original Astro Button and the Craft Card, which
each had a resolve file of their own:

- **The component's CSS file is mechanics.** It reads only its own slots
  (`--_backgroundColor` and so on): structure, gates, states, layout. It is
  written by hand and is readable.
- **The resolve map is generated by JS.** Which level fills which slot,
  in which order (custom → component → theme → default), for every
  property, variant and state. It is fragile, machine-shaped and never
  edited by hand: a mechanical precondition and coupling logic, not
  design.

This fits what already exists: the voice cells, Surface adjacency and the
text-box kernel are generated from tables, and recipes are data
(ADR-0018). A generated resolve map is also where ADR-0008's "one
declaration per level, one seam each" can be held mechanically instead of
by discipline. A freshness test guards it like every other generated
file (hard rule 4).

Built for voice claims: a composition declares `claims` in its recipe and
`engine/claims.js` writes the channel lines (ADR-0006 amendment;
CoverComposition is the first consumer). Open: what is the source table for
the other resolve maps (per component, or one map for all), and
where does the lab live (the control room, or a `lab/` branch as with the
grid playground)?

### 3. A consumer guide: how values reach the front end (later)

The lab describes the seams by measuring them; a consumer needs them
described as an API. When the answers settle, a guide (a docs page, not
this draft) should say:
- **how a value reaches the page** — table → factory → token → voice cell →
  channel → component slot → property, and where each step is visible in
  the inspector;
- **what can be turned**, and by whom — the instance's custom level
  (`--custom-*`), a composition's claim (channels pointed at `--voice-*`),
  a voice's optional overrides in the theme;
- **how one should turn it** — the recommended way per case, the ways the
  lab showed to be wrong (reaching into private slots, RAW values, static
  claims where the answer depends on context, colour without a ground), and
  who answers for an exception.

The lab page stays the evidence; the guide is the distilled form. It is
written when the factories are in place — the generated resolve maps, the
channel mapping a claim writes, the shadow recipe — since the guide
describes what they produce, and refined as the open questions close.

### 4. A future bench: size as one knob (parked)

If every size slot in buttons and fields were in `em` (padding, icon size,
icon margin), a size would be a single font-size stop and everything else
would follow. The custom level would shrink from five fields to one, the
size fabric would nearly disappear, and a button and a field of the same
size would share a height by construction. Half of it exists already:
`paddingInline` is `1.4em`/`1.6em` and lg's `paddingBlock` is `0.8em`.

The traps a bench must measure:
- proportional is not always right: a small button often needs relatively
  more air, and a scaled-down lg can fall under the minimum target size
  (WCAG 2.5.8, 24px). It needs a floor that does not scale
  (`min-block-size`);
- the stops are not proportional today (sm and md share a rem
  `paddingBlock`, the em ratios differ per stop), so going all-`em` is a
  design decision about the ratios, not a rewrite.

Open: one ratio for every stop plus a floor, or each stop keeps its own
ratios?

## Constraints found so far

- **A composition does not contain another composition.** Asked in the
  discussion: in what world does a Teaser contain another composition?
  This bounds the downward leak of a `--component-*` claim to the
  primitives a composition hosts. It is not yet written as a rule in the
  ledger.
- **Closed ranges.** A claim made inside a range with both a minimum and a
  maximum lives only there. Exactly one truth is active per range, and the
  claim cannot spill into the next range.

## Open questions

1. Does the voice speak in **roles** ("raised ground", an object lying on
   me) or in **components** ("card")? The button channels are already
   named after a component.
2. Is the voice claim a kernel contract on any root, or a per-component
   guard (B)?
3. Which levels are mandatory from the start: only `--custom-*`, or
   `--component-*` too (C, D)?
4. Does a turn happen per property or per stop (D)? If per stop, how is a
   stop published as a group?
5. Where does "md on mobile, lg on large screens" live? If it is a turn,
   it lives in a composition. Is a site-wide rule in the tiers and the
   theme a different thing?
6. Should "a composition never contains a composition" and "claims live in
   closed ranges" become rules in the ledger?
7. How is the chain written under ADR-0008: one declaration per level, one
   seam each, and what are the names?
8. Is a composition's turn a `--custom` fill (an exception) or a
   `--component` fill, leaving `--component` for the system's generated
   couplings?
9. Which components are a ground, and may claim at all?
10. Is the nesting matrix brand data or a system rule?
11. Is a card's prominence absolute or relative to its ground? (Lab case 9 leans relative, through the voice's ink.)
12. How does a claimed card's shadow read the base it falls on? (Answered in the lab: the ground as a snapshot, case 7.)
