export const directusContentAdapter = {
  async readItem(collection, id, opts) {
    const nuxt = typeof useNuxtApp !== 'undefined' ? useNuxtApp() : (globalThis && globalThis.__NUXT_APP) || {}
    const { $directus, $readItem } = nuxt
    if ($directus && typeof $directus.request === 'function') {
      return $directus.request($readItem(collection, id, opts))
    }
    throw new Error('Directus client not available')
  },
  async readItems(collection, opts) {
    const nuxt = typeof useNuxtApp !== 'undefined' ? useNuxtApp() : (globalThis && globalThis.__NUXT_APP) || {}
    const { $directus, $readItems } = nuxt
    if ($directus && typeof $directus.request === 'function') {
      return $directus.request($readItems(collection, opts))
    }
    throw new Error('Directus client not available')
  },
  async createItem(collection, data) {
    const nuxt = typeof useNuxtApp !== 'undefined' ? useNuxtApp() : (globalThis && globalThis.__NUXT_APP) || {}
    const { $directus, $createItem } = nuxt
    if ($directus && typeof $directus.request === 'function') {
      return $directus.request($createItem(collection, data))
    }
    throw new Error('Directus client not available')
  },
  async updateItem(collection, id, data) {
    const nuxt = typeof useNuxtApp !== 'undefined' ? useNuxtApp() : (globalThis && globalThis.__NUXT_APP) || {}
    const { $directus, $updateItem } = nuxt
    if ($directus && typeof $directus.request === 'function') {
      return $directus.request($updateItem(collection, id, data))
    }
    throw new Error('Directus client not available')
  },
  async deleteItem(collection, id) {
    const nuxt = typeof useNuxtApp !== 'undefined' ? useNuxtApp() : (globalThis && globalThis.__NUXT_APP) || {}
    const { $directus, $deleteItem } = nuxt
    if ($directus && typeof $directus.request === 'function') {
      return $directus.request($deleteItem(collection, id))
    }
    throw new Error('Directus client not available')
  },
}

export default directusContentAdapter
