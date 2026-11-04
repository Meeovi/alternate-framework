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

  // Every copy of the widget, not just the first: Cloudflare Rocket Loader
  // re-runs the page's scripts, so the CookieYes script can load twice and
  // the second #cya11y-container's button stayed in the corner (4 Nov 2026).
  const adopt = (): boolean => {
    const containers = document.querySelectorAll<HTMLElement>('#cya11y-container')
    let found = false
    containers.forEach((container) => {
      const root = container.shadowRoot
      if (!root) return
      found = true
      if (!root.adoptedStyleSheets.includes(sheet)) {
        root.adoptedStyleSheets = [...root.adoptedStyleSheets, sheet]
      }
    })
    return found
  }

  adopt()

  // The widget script loads async (and maybe more than once): keep watching
  // for a minute, then stop (blocked, consent declined, offline).
  const observer = new MutationObserver(() => { adopt() })
  observer.observe(document.body, { childList: true, subtree: true })
  setTimeout(() => { adopt(); observer.disconnect() }, 60_000)
})
