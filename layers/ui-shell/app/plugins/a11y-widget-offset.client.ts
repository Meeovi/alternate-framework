/**
 * Hides the CookieYes accessibility widget's floating button (loaded by
 * layers/shared): the menu opens from an "Accessibility" link instead — in
 * the footer (FooterNav.vue) and on the mobile Browse page (menu-page.vue),
 * through useAccessibilityWidget().
 *
 * The button lives in the widget's own (open) shadow root, out of reach of
 * page CSS, so the rule is adopted into that root once the widget mounts.
 * A constructed stylesheet also sidesteps the CSP's style-src. Hiding it
 * with display:none leaves the button clickable from script, and the menu
 * it opens is outside it.
 */
const RULE = `.cya11y-widget-icon { display: none !important; }`

export default defineNuxtPlugin(() => {
  if (typeof CSSStyleSheet === 'undefined' || !('adoptedStyleSheets' in Document.prototype)) return

  const sheet = new CSSStyleSheet()
  sheet.replaceSync(RULE)

  const adopt = (): boolean => {
    const root = document.getElementById('cya11y-container')?.shadowRoot
    if (!root) return false
    if (!root.adoptedStyleSheets.includes(sheet)) {
      root.adoptedStyleSheets = [...root.adoptedStyleSheets, sheet]
    }
    return true
  }

  if (adopt()) return

  // The widget script loads async; stop watching once it's in, or after a
  // minute if it never arrives (blocked, consent declined, offline).
  const observer = new MutationObserver(() => {
    if (adopt()) observer.disconnect()
  })
  observer.observe(document.body, { childList: true, subtree: true })
  setTimeout(() => observer.disconnect(), 60_000)
})
