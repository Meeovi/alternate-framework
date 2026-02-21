import { defineNuxtPlugin } from 'nuxt/app'

export default defineNuxtPlugin((nuxtApp: any) => {
  function setManager(m: any) {
    if (!m) return
    if (!nuxtApp.$searchManager) {
      nuxtApp.$searchManager = m
      if (typeof nuxtApp.provide === 'function') nuxtApp.provide('searchManager', m)
      if (typeof nuxtApp.provide === 'function') nuxtApp.provide('search', m)
    }
  }

  // Immediate attempt using common locations
  setManager(nuxtApp.$searchManager || nuxtApp.searchManager || nuxtApp._context?.searchManager || nuxtApp?.nuxt?.searchManager || (globalThis as any).searchManager)

  // Listen for app events if an event bus is available on the Nuxt context
  const bus = nuxtApp._context?.eventBus || nuxtApp?.eventBus
  if (bus && typeof bus.on === 'function') {
    bus.on('adapter:registered', (payload: any) => {
      try {
        if (payload?.key === 'search') {
          const mgr = nuxtApp.searchManager || nuxtApp._context?.searchManager || (globalThis as any).searchManager
          setManager(mgr)
        }
      } catch (e) {
        /* noop */
      }
    })

    bus.on('app:ready', () => {
      try {
        const mgr = nuxtApp.searchManager || nuxtApp._context?.searchManager || (globalThis as any).searchManager
        setManager(mgr)
      } catch (e) {
        /* noop */
      }
    })
  }

  // Fallback: short poll for the manager (useful when module registers it slightly later)
  // Only run polling in the browser to avoid server-side timers.
  if (!nuxtApp.$searchManager && typeof window !== 'undefined' && !import.meta.env.SSR) {
    let attempts = 0
    let id: any = null
    id = setInterval(() => {
      const mgr = nuxtApp.searchManager || nuxtApp._context?.searchManager || (globalThis as any).searchManager
      if (mgr) {
        setManager(mgr)
        clearInterval(id)
      }
      attempts++
      if (attempts > 30) clearInterval(id)
    }, 200)
  }

  return {
    provide: {
      searchManager: nuxtApp.$searchManager
    }
  }
})
