// composables/updatePost.js
export default async function updatePost(websiteId, websiteData) {
  const { $sdk } = useNuxtApp()

  try {
    if ($sdk?.content && typeof $sdk.content.updateItem === 'function') {
      const resp = await $sdk.content.updateItem('websites', websiteId, websiteData)
      return resp?.data || resp
    }
    throw new Error('No adapter content client available for updateItem')
  } catch (error) {
    console.error('Error updating bookmark:', error)
    throw error
  }
}