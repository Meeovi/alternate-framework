// composables/deleteShort.js
import { useSdkContentAdapter } from '#imports'

export default async function deleteShort(shortId) {
    const { deleteItem } = useSdkContentAdapter()

    try {
      await deleteItem('shorts', shortId)
      console.log('Short deleted successfully');
    } catch (error) {
      console.error('Error deleting short:', error);
      throw error;
    }
}
  