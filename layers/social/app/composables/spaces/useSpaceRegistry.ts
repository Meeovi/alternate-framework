// composables/useSpaceRegistry.ts
type ReadItemsFn = (collection: string, options?: { fields?: string[]; filter?: Record<string, any> }) => Promise<any>

/**
 * Pure fetcher: builds the registry using a provided Nuxt app instance.
 * Use this when you are outside of a Vue setup function (for example in a page
 * async loader where you already have access to `useNuxtApp()` or in a plugin).
 */
export async function fetchSpaceRegistry(nuxtApp?: { $readItems?: ReadItemsFn }) {
  // Determine the readItems function: prefer nuxtApp.$readItems, fall back to adapter
  let readItemsFn: ReadItemsFn | undefined = undefined

  if (nuxtApp && typeof nuxtApp.$readItems === 'function') {
    readItemsFn = nuxtApp.$readItems
  } else {
    const mod = await import('../useAdapterRequest')
    const adapter = (mod && typeof (mod as any).default === 'function') ? (mod as any).default() : (mod as any)
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
      component: () => import(/* @vite-ignore */ s.component_path)
    }
  }

  return registry
}

/**
 * Composable wrapper: convenience function for use inside Vue `setup()`.
 * If you call this outside of a setup/plugin/middleware you MUST pass a
 * Nuxt app instance explicitly to avoid the "called outside" error.
 */
import useAdapterRequest from '../useAdapterRequest'

export const useSpaceRegistry = async (nuxtApp?: { $readItems?: ReadItemsFn }) => {
  const runtimeUseNuxtApp = (globalThis as any).useNuxtApp
  const nuxt = nuxtApp ?? (typeof runtimeUseNuxtApp === 'function' ? runtimeUseNuxtApp() : undefined)

  if (nuxt && typeof nuxt.$readItems === 'function') {
    return fetchSpaceRegistry(nuxt as { $readItems?: ReadItemsFn })
  }

  // fall back to adapter composable when called inside setup without a nuxtApp arg
  const { readItems } = useAdapterRequest()
  return fetchSpaceRegistry({ $readItems: readItems })
}