// composables/deleteWebsite.js
export default async function deleteWebsite(websiteId) {
  const content = useContent()

  try {
    if (content && typeof content.deleteItem === 'function') {
      await content.deleteItem('websites', websiteId)
      return true
    }
    throw new Error('No adapter content client available for deleteItem')
  } catch (error) {
    console.error('Error deleting bookmark:', error)
    throw error
  }
}
  
import useContent from '#shared/app/composables/content/useContent'
