// composables/updatePost.js
export default async function updatePost(websiteId, websiteData) {
  const content = useContentAdapter()
  const nuxt = typeof useNuxtApp !== 'undefined' ? useNuxtApp() : (globalThis && globalThis.__NUXT_APP) || {}

  try {
    if (content && typeof content.updateItem === 'function') {
      const resp = await content.updateItem('websites', websiteId, websiteData)
      return resp?.data || resp
    }
    const { $directus, $updateItem } = nuxt
    return await $directus.request($updateItem('websites', websiteId, websiteData))
  } catch (error) {
    console.error('Error updating bookmark:', error)
    throw error
  }
}
  