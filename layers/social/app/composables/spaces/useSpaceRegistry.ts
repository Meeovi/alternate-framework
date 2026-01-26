// composables/useSpaceRegistry.ts
type ReadItemsFn = (collection: string, options?: { fields?: string[]; filter?: Record<string, any> }) => Promise<Array<Record<string, any>>>

/**
 * Pure fetcher: builds the registry using a provided Nuxt app instance.
 * Use this when you are outside of a Vue setup function (for example in a page
 * async loader where you already have access to `useNuxtApp()` or in a plugin).
 */
export async function fetchSpaceRegistry(nuxtApp: { $readItems?: ReadItemsFn }) {
  if (!nuxtApp || typeof nuxtApp.$readItems !== 'function') {
    throw new Error('fetchSpaceRegistry requires a Nuxt app instance with `$readItems`')
  }

  const { $readItems } = nuxtApp

  const spaces = await $readItems('space_type', {
    fields: ['slug', 'component_path', 'layout_name'],
    filter: { enabled: { _eq: true } }
  })

  const registry: Record<string, {
    layout: string
    component: () => Promise<any>
  }> = {}

  for (const space of spaces) {
    registry[space.slug] = {
      layout: space.layout_name,
      component: () => import(/* @vite-ignore */ space.component_path)
    }
  }

  return registry
}

/**
 * Composable wrapper: convenience function for use inside Vue `setup()`.
 * If you call this outside of a setup/plugin/middleware you MUST pass a
 * Nuxt app instance explicitly to avoid the "called outside" error.
 */
export const useSpaceRegistry = async (nuxtApp?: { $readItems?: ReadItemsFn }) => {
  const nuxt = nuxtApp ?? (typeof useNuxtApp === 'function' ? useNuxtApp() : undefined)

  if (!nuxt) {
    throw new Error('useSpaceRegistry must be called inside a Vue setup() or you must pass a Nuxt app instance as the first argument')
  }

  return fetchSpaceRegistry(nuxt as { $readItems?: ReadItemsFn })
}