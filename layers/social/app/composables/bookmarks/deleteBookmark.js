// composables/deleteWebsite.js
export default async function deleteWebsite(websiteId) {
  const content = useContentAdapter()
  const nuxt = typeof useNuxtApp !== 'undefined' ? useNuxtApp() : (globalThis && globalThis.__NUXT_APP) || {}

  try {
    if (content && typeof content.deleteItem === 'function') {
      await content.deleteItem('websites', websiteId)
      return true
    }
    const { $directus, $deleteItem } = nuxt
    await $directus.request($deleteItem('websites', websiteId))
    return true
  } catch (error) {
    console.error('Error deleting bookmark:', error)
    throw error
  }
}
  