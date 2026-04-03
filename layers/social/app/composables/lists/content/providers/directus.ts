export const directusContentAdapter = {
  async readItem(collection: string, id: string | number, opts?: any) {
    const maybeUseNuxt = (globalThis as any).useNuxtApp
    const nuxt = typeof maybeUseNuxt === 'function' ? maybeUseNuxt() : (globalThis && (globalThis as any).__NUXT_APP) || {}
    const { $directus, $readItem } = nuxt as any
    if ($directus && typeof $directus.request === 'function') {
      return $directus.request($readItem(collection, id, opts))
    }
    throw new Error('Directus client not available')
  },
  async readItems(collection: string, opts?: any) {
    const maybeUseNuxt = (globalThis as any).useNuxtApp
    const nuxt = typeof maybeUseNuxt === 'function' ? maybeUseNuxt() : (globalThis && (globalThis as any).__NUXT_APP) || {}
    const { $directus, $readItems } = nuxt as any
    if ($directus && typeof $directus.request === 'function') {
      return $directus.request($readItems(collection, opts))
    }
    throw new Error('Directus client not available')
  },
  async createItem(collection: string, data: any) {
    const maybeUseNuxt = (globalThis as any).useNuxtApp
    const nuxt = typeof maybeUseNuxt === 'function' ? maybeUseNuxt() : (globalThis && (globalThis as any).__NUXT_APP) || {}
    const { $directus, $createItem } = nuxt as any
    if ($directus && typeof $directus.request === 'function') {
      return $directus.request($createItem(collection, data))
    }
    throw new Error('Directus client not available')
  },
  async updateItem(collection: string, id: string | number, data: any) {
    const maybeUseNuxt = (globalThis as any).useNuxtApp
    const nuxt = typeof maybeUseNuxt === 'function' ? maybeUseNuxt() : (globalThis && (globalThis as any).__NUXT_APP) || {}
    const { $directus, $updateItem } = nuxt as any
    if ($directus && typeof $directus.request === 'function') {
      return $directus.request($updateItem(collection, id, data))
    }
    throw new Error('Directus client not available')
  },
  async deleteItem(collection: string, id: string | number) {
    const maybeUseNuxt = (globalThis as any).useNuxtApp
    const nuxt = typeof maybeUseNuxt === 'function' ? maybeUseNuxt() : (globalThis && (globalThis as any).__NUXT_APP) || {}
    const { $directus, $deleteItem } = nuxt as any
    if ($directus && typeof $directus.request === 'function') {
      return $directus.request($deleteItem(collection, id))
    }
    throw new Error('Directus client not available')
  },
}

export default directusContentAdapter
