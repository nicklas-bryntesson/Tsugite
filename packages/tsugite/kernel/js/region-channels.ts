// Regions and the channels their children speak through (ADR-0029). A region carries
// data-region; a child closes the region nearest above it through data-channel="close",
// without knowing its id. The platform opens and closes a <dialog> region through invoker
// commands (command + commandfor) and closes it by its closedby rule. This file fills in
// where the platform is missing — both features are newer than the support contract
// (Chrome 109) — so the markup is the same in every engine.
//
// One pure function, unit-tested without a DOM, one wiring step, and one install that
// listens on the document. Listening on the document, not on each region, means a region or
// an opener mounted later by any framework is covered without being found first.
//
//   commandOf(command)              → what an invoker command asks a dialog to do
//   wireRegion(region)              → title and description channels → aria-labelledby/-describedby
//   installRegionChannels(doc)      → the channels and the fallbacks, once per document

/** The invoker commands a dialog region answers. `request-close` is left to the platform. */
export type DialogCommand = 'show-modal' | 'close'

export function commandOf(command: string | null): DialogCommand | null {
  return command === 'show-modal' || command === 'close' ? command : null
}

declare global {
  interface Document {
    __regionChannels?: true
  }
}

let sequence = 0

/** The elements of one channel that belong to this region — not to a region inside it. */
function own(region: Element, channel: string): Element[] {
  return [...region.querySelectorAll(`[data-channel="${channel}"]`)].filter((el) => el.closest('[data-region]') === region)
}

function idOf(el: Element, region: Element, channel: string): string {
  if (!el.id) el.id = `${region.id || 'region'}-${channel}-${++sequence}`
  return el.id
}

/**
 * Wire a region's title and description channels (ADR-0029 §5): the first title names it
 * through aria-labelledby, every description describes it through aria-describedby. The
 * words stay in the child's markup, so they keep the child's lang. Safe to call again —
 * the install calls it for every region on the page and whenever focus enters one, which
 * is the moment a region opens in every engine.
 */
export function wireRegion(region: Element): void {
  const title = own(region, 'title')[0]
  if (title) region.setAttribute('aria-labelledby', idOf(title, region, 'title'))
  const descriptions = own(region, 'description')
  if (descriptions.length) {
    region.setAttribute('aria-describedby', descriptions.map((el) => idOf(el, region, 'description')).join(' '))
  }
}

export function installRegionChannels(doc: Document = document): void {
  if (doc.__regionChannels) return
  doc.__regionChannels = true

  const win = doc.defaultView
  if (!win) return
  // The title and description channels: every region on the page now, and a region again
  // when focus enters it — content mounted between page load and opening is wired then.
  const wireAll = () => doc.querySelectorAll('[data-region]').forEach(wireRegion)
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', wireAll, { once: true })
  else wireAll()
  doc.addEventListener('focusin', (event) => {
    const region = (event.target as Element | null)?.closest?.('[data-region]')
    if (region) wireRegion(region)
  })

  // The close channel (ADR-0029 §5): any element marked data-channel="close" closes the
  // region nearest above it, with its value as the returnValue. A button in a form is a
  // submit button; the close replaces the submit. A region that is not a <dialog> has no
  // close() and is told instead, through region:close, and closes itself its own way.
  doc.addEventListener('click', (event) => {
    const source = (event.target as Element | null)?.closest?.('[data-channel="close"]')
    if (!source || source.matches(':disabled')) return
    const region = source.closest('[data-region]')
    if (!region) return
    event.preventDefault()
    const returnValue = source instanceof win.HTMLButtonElement ? source.value : ''
    if (region instanceof win.HTMLDialogElement) {
      if (region.open) region.close(returnValue)
    } else {
      region.dispatchEvent(new CustomEvent('region:close', { detail: { returnValue } }))
    }
  })

  const hasCommand = 'command' in win.HTMLButtonElement.prototype
  const hasClosedBy = 'closedBy' in win.HTMLDialogElement.prototype

  if (!hasCommand) {
    doc.addEventListener('click', (event) => {
      const button = (event.target as Element | null)?.closest?.('button[command][commandfor]')
      if (!(button instanceof win.HTMLButtonElement) || button.disabled) return
      const command = commandOf(button.getAttribute('command'))
      const target = doc.getElementById(button.getAttribute('commandfor') ?? '')
      if (!command || !(target instanceof win.HTMLDialogElement)) return
      // A button inside a form is a submit button; the command replaces the submit.
      event.preventDefault()
      if (command === 'show-modal' && !target.open) target.showModal()
      if (command === 'close' && target.open) target.close(button.value)
    })
  }

  // closedby="any": a click on the layer itself — not on the content in it — closes. A modal
  // region is a transparent layer over the whole viewport (ADR-0029 §7), so the platform's
  // light dismiss, which needs a click outside the dialog's box, never fires; this does, in
  // every engine. The press must start on the layer too: a text selection dragged out of
  // the content ends in a click on the layer and must not close it.
  let pressedOnLayer: EventTarget | null = null
  doc.addEventListener('pointerdown', (event) => {
    pressedOnLayer = event.target instanceof win.HTMLDialogElement ? event.target : null
  })
  doc.addEventListener('click', (event) => {
    const dialog = event.target
    const pressed = pressedOnLayer
    pressedOnLayer = null
    if (!(dialog instanceof win.HTMLDialogElement) || !dialog.open || pressed !== dialog) return
    if (dialog.getAttribute('closedby') === 'any') dialog.close()
  })

  if (!hasClosedBy) {
    // closedby="none": Esc is a close request the dialog refuses.
    doc.addEventListener(
      'cancel',
      (event) => {
        const dialog = event.target
        if (dialog instanceof win.HTMLDialogElement && dialog.getAttribute('closedby') === 'none') event.preventDefault()
      },
      true,
    )
  }
}
