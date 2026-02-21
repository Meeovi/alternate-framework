import { defineNitroPlugin } from '#imports'

export default defineNitroPlugin(() => {
  try {
    // ensure adapter composables are initialised on server startup
    const { useCommerceAdapter, useContentAdapter } = require('#imports')
    // call them to ensure any provider registration side-effects run
    if (typeof useCommerceAdapter === 'function') {
      try { void useCommerceAdapter() } catch (e) { /* ignore */ }
    }
    if (typeof useContentAdapter === 'function') {
      try { void useContentAdapter() } catch (e) { /* ignore */ }
    }
  } catch (e) {
    // ignore: plugin should be best-effort in this layer
    // console.warn('init-adapters.server plugin failed to initialize adapters', e)
  }
})
