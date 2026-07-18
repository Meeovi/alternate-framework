// composables/updatePost.js
export default async function updatePost(websiteId, websiteData) {
  const { $directus, $updateItem } = useNuxtApp()

  try {
    if ($directus && typeof $updateItem === 'function') {
      const resp = await $directus.request($updateItem('websites', websiteId, websiteData))
      return resp?.data || resp
    }
    throw new Error('No Directus client available for updateItem')
  } catch (error) {
    console.error('Error updating bookmark:', error)
    throw error
  }
}