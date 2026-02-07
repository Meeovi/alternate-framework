export interface PopupPayload {
  [key: string]: unknown
}

function genId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

export function showPopup(popupId: string, payload: PopupPayload = {}) {
  const popup = {
    id: genId(),
    popupId,
    payload,
    openedAt: Date.now(),
  }

  if (typeof window !== 'undefined' && 'CustomEvent' in window) {
    window.dispatchEvent(new CustomEvent('mframework:popup:open', { detail: popup }))
  }

  return popup
}

export function closePopup(popupId: string) {
  if (typeof window !== 'undefined' && 'CustomEvent' in window) {
    window.dispatchEvent(new CustomEvent('mframework:popup:close', { detail: { popupId } }))
  }
}

export default { showPopup, closePopup }
