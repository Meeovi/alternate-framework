import { useAlternateContext } from '@meeovi/core'

export function useContentFallback() {
  try {
    const ctx = useAlternateContext() as any
    const adapter = ctx.getAdapter('catalog')
    // If a content-capable adapter is available and exposes methods, use it
    if (adapter && typeof adapter.listShops === 'function') {
      return {
        adapter,
        listShops: (opts?: any) => adapter.listShops(opts),
        getBrandBySlug: (slug: string) => adapter.getBrandBySlug?.(slug),
        getPage: (id: string) => adapter.getPage?.(id)
      }
    }
  } catch (e) {
    // ignore
  }

  // Fallback to Directus via Nuxt runtime
  return {
    adapter: null,
    async listShops(params?: Record<string, unknown>) {
      const nuxtApp = useNuxtApp() as any
      if (nuxtApp?.$directus && nuxtApp.$readItems) {
        const res = await nuxtApp.$directus.request(nuxtApp.$readItems('shops', params || {}))
        return res || []
      }
      return []
    },
    async listBrands(params?: Record<string, unknown>) {
      const nuxtApp = useNuxtApp() as any
      if (nuxtApp?.$directus && nuxtApp.$readItems) {
        const res = await nuxtApp.$directus.request(nuxtApp.$readItems('brands', params || {}))
        return res || []
      }
      return []
    },
    async getBrandBySlug(slug: string) {
      const nuxtApp = useNuxtApp() as any
      if (nuxtApp?.$directus && nuxtApp.$readItems) {
        const res = await nuxtApp.$directus.request(nuxtApp.$readItems('brands', { filter: { slug: { _eq: slug } }, limit: 1 }))
        return res?.[0] || null
      }
      return null
    },
    async getPage(id: string) {
      const nuxtApp = useNuxtApp() as any
      if (nuxtApp?.$directus && nuxtApp.$readItem) {
        return await nuxtApp.$directus.request(nuxtApp.$readItem('pages', id))
      }
      return null
    }
  }
}

export default useContentFallback
