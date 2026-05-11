// composables/deleteWebsite.js
export default async function deleteWebsite(websiteId) {
  const content = useContentAdapter()

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
  