// composables/updatePost.js
export default async function updatePost(websiteId, websiteData) {
  const { $directus, $readItem, $readItems, $createItem, $updateItem, $deleteItem, $uploadFiles } = useNuxtApp()

  try {
    if (content && typeof content.updateItem === 'function') {
      const resp = await $directus.request($updateItem('websites', websiteId, websiteData)
      return resp?.data || resp
    }
    throw new Error('No adapter content client available for updateItem')
  } catch (error) {
    console.error('Error updating bookmark:', error)
    throw error
  }
}
  
