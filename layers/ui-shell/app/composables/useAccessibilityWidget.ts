// Opens the CookieYes accessibility menu from a link of our own. Its
// floating button is hidden (plugins/a11y-widget-offset.client.ts) but stays
// in the widget's shadow root, and clicking it is what opens the menu.

export function useAccessibilityWidget() {
  function openAccessibilityMenu(): boolean {
    const button = document.getElementById('cya11y-container')?.shadowRoot
      ?.querySelector<HTMLElement>('.cya11y-menu-btn')
    if (!button) return false
    button.click()
    return true
  }

  return { openAccessibilityMenu }
}
