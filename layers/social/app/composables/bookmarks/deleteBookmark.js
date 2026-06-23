// composables/deleteWebsite.js
export default async function deleteWebsite(websiteId) {
  const { $sdk } = useNuxtApp()

  try {
    if ($sdk?.content && typeof $sdk.content.deleteItem === 'function') {
      await $sdk.content.deleteItem('websites', websiteId)
      return true
    }
    throw new Error('No adapter content client available for deleteItem')
  } catch (error) {
    console.error('Error deleting bookmark:', error)
    throw error
  }
}