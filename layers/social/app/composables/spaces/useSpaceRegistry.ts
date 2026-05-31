// composables/useSpaceRegistry.ts

type ReadItemsFn = (collection: string, options?: { fields?: string[]; filter?: Record<string, any> }) => Promise<any>

/**
 * Pure fetcher: builds the registry using a provided Nuxt app instance.
 * Use this when you are outside of a Vue setup function (for example in a page
 * async loader where you already have access to `useNuxtApp()` or in a plugin).
 */
export async function fetchSpaceRegistry(nuxtApp?: { read?: ReadItemsFn }) {
  // Determine the readItems function: prefer nuxtApp.read, fall back to adapter
  let readItemsFn: ReadItemsFn | undefined = undefined

  if (nuxtApp && typeof nuxtApp.read === 'function') {
    readItemsFn = nuxtApp.read
  } else {
    const adapter = useContent()
    const { readItems } = adapter as any
    readItemsFn = readItems
  }

  const spacesResp = await (readItemsFn as ReadItemsFn)('space_type', {
    fields: ['slug', 'component_path', 'layout_name'],
    filter: { enabled: { _eq: true } }
  })

  const spaces = spacesResp?.data || spacesResp || []

  const registry: Record<string, {
    layout: string
    component: () => Promise<any>
  }> = {}

  for (const s of spaces) {
    registry[s.slug] = {
      layout: s.layout_name,
      // DISABLED: Dynamic @vite-ignore import causing Vite invalidation loop
      component: () => Promise.reject(new Error('Space component loading disabled in dev mode'))
    }
  }

  return registry
}

/**
 * Composable wrapper: convenience function for use inside Vue `setup()`.
 * If you call this outside of a setup/plugin/middleware you MUST pass a
 * Nuxt app instance explicitly to avoid the "called outside" error.
 */
export const useSpaceRegistry = async (nuxtApp?: { read?: ReadItemsFn }) => {
  const runtimeUseNuxtApp = (globalThis as any).useNuxtApp
  const nuxt = nuxtApp ?? (typeof runtimeUseNuxtApp === 'function' ? runtimeUseNuxtApp() : undefined)

  if (nuxt && typeof nuxt.read === 'function') {
    return fetchSpaceRegistry(nuxt as { read?: ReadItemsFn })
  }

  // fall back to adapter composable when called inside setup without a nuxtApp arg
  const { readItems } = useContent()
  return fetchSpaceRegistry({ read: readItems })
}
import useContent from '#shared/app/composables/content/useContent'
