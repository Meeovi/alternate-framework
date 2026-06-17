// composables/deleteWebsite.js
export default async function deleteWebsite(websiteId) {
  const { $directus, $readItem, $readItems, $createItem, $updateItem, $deleteItem, $uploadFiles } = useNuxtApp()

  try {
    if (content && typeof content.deleteItem === 'function') {
      await $directus.request($deleteItem('websites', websiteId))
      return true
    }
    throw new Error('No adapter content client available for deleteItem')
  } catch (error) {
    console.error('Error deleting bookmark:', error)
    throw error
  }
}
  
