/**
 * Lifts the CookieYes accessibility button (loaded by layers/shared) above
 * the mobile bottom tab bar (components/menus/mobile/mobileNav.vue), which
 * it otherwise covers: the widget pins itself 20px from the bottom right.
 *
 * The button lives in the widget's own (open) shadow root, out of reach of
 * page CSS, so the rule is adopted into that root once the widget mounts.
 * A constructed stylesheet also sidesteps the CSP's style-src. The 1100px
 * breakpoint matches mobileNav.vue's.
 */
const RULE = `@media (max-width: 1100px) {
  .cya11y-widget-icon { bottom: calc(76px + env(safe-area-inset-bottom, 0px)) !important; }
}`

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
