// composables/deleteShort.js
import useAdapterRequest from '~/composables/useAdapterRequest'

export default async function deleteShort(shortId) {
    const { deleteItem } = useAdapterRequest()

    try {
      await deleteItem('shorts', shortId)
      console.log('Short deleted successfully');
    } catch (error) {
      console.error('Error deleting short:', error);
      throw error;
    }
}
  