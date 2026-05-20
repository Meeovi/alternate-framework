// composables/updateShort.js
import { useSdkContentAdapter } from '#imports'

export default async function updateShort(shortId, shortData) {
    const { updateItem } = useSdkContentAdapter()

    try {
      const short = await updateItem('shorts', shortId, shortData)
      return short;
    } catch (error) {
      console.error('Error updating short:', error);
      throw error;
    }
}
  