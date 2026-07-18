// composables/deleteWebsite.js
export default async function deleteWebsite(websiteId) {
  const { $directus, $deleteItem } = useNuxtApp()

  try {
    if ($directus && typeof $deleteItem === 'function') {
      await $directus.request($deleteItem('websites', websiteId))
      return true
    }
    throw new Error('No Directus client available for deleteItem')
  } catch (error) {
    console.error('Error deleting bookmark:', error)
    throw error
  }
}