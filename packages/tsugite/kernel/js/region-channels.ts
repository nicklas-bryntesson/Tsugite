// Regions and the channels their children speak through (ADR-0029). A region carries
// data-region; the platform opens and closes a <dialog> region through invoker commands
// (command + commandfor) and closes it by its closedby rule. This file fills in where the
// platform is missing — both features are newer than the support contract (Chrome 109) —
// so the markup is the same in every engine.
//
// Two pure functions, unit-tested without a DOM, and one install that listens on the
// document. Listening on the document, not on each region, means a region or an opener
// mounted later by any framework is covered without being found first.
//
//   commandOf(command)              → what an invoker command asks a dialog to do
//   isOutside(box, x, y)            → whether a click on a dialog landed on its backdrop
//   installRegionChannels(doc)      → the fallbacks, once per document

/** The invoker commands a dialog region answers. `request-close` is left to the platform. */
export type DialogCommand = 'show-modal' | 'close'

export function commandOf(command: string | null): DialogCommand | null {
  return command === 'show-modal' || command === 'close' ? command : null
}

export interface Box {
  left: number
  right: number
  top: number
  bottom: number
}

/** A click whose target is the dialog itself and that lies outside its box hit the backdrop. */
export function isOutside(box: Box, x: number, y: number): boolean {
  return x < box.left || x > box.right || y < box.top || y > box.bottom
}

declare global {
  interface Document {
    __regionChannels?: true
  }
}

export function installRegionChannels(doc: Document = document): void {
  if (doc.__regionChannels) return
  doc.__regionChannels = true

  const win = doc.defaultView
  if (!win) return
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
    // closedby="any": a click on the backdrop closes. The backdrop belongs to the dialog,
    // so the event's target is the dialog and the point lies outside its box.
    doc.addEventListener('click', (event) => {
      const dialog = event.target
      if (!(dialog instanceof win.HTMLDialogElement) || !dialog.open) return
      if (dialog.getAttribute('closedby') !== 'any') return
      if (isOutside(dialog.getBoundingClientRect(), event.clientX, event.clientY)) dialog.close()
    })
  }
}
