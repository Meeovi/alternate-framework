declare const defineNuxtPlugin: any

export default defineNuxtPlugin((nuxtApp) => {
  try {
    const { useCommerceAdapter, useContentAdapter } = nuxtApp.$imports || (globalThis as any).__imports__ || {}
    // try common import pattern
    let commerce = null
    let content = null
    try {
      // prefer direct global import if available
      const imp = require ? require('#imports') : null
      if (imp && imp.useCommerceAdapter) commerce = imp.useCommerceAdapter
      if (imp && imp.useContentAdapter) content = imp.useContentAdapter
    } catch (e) {
      // fallback to nuxt auto-imported composables
    }
    try { if (typeof commerce === 'function') void commerce() } catch (e) {}
    try { if (typeof content === 'function') void content() } catch (e) {}
  } catch (e) {
    // noop
  }
})
