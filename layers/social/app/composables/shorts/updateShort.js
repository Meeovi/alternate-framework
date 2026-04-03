// composables/updateShort.js
import useAdapterRequest from '#social/app/composables/core/useAdapterRequest'

export default async function updateShort(shortId, shortData) {
    const { updateItem } = useAdapterRequest()

    try {
      const short = await updateItem('shorts', shortId, shortData)
      return short;
    } catch (error) {
      console.error('Error updating short:', error);
      throw error;
    }
}
  