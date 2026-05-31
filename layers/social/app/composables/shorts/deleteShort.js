// composables/deleteShort.js
import useContent from '#shared/app/composables/content/useContent'

export default async function deleteShort(shortId) {
    const { deleteItem } = useContent()

    try {
      await deleteItem('shorts', shortId)
      console.log('Short deleted successfully');
    } catch (error) {
      console.error('Error deleting short:', error);
      throw error;
    }
}
  