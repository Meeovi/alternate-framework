// composables/updateShort.js
import useContent from '#shared/app/composables/content/useContent'

export default async function updateShort(shortId, shortData) {
    const { updateItem } = useContent()

    try {
      const short = await updateItem('shorts', shortId, shortData)
      return short;
    } catch (error) {
      console.error('Error updating short:', error);
      throw error;
    }
}
  