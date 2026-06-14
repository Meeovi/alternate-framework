// composables/updateShort.js

export default async function updateShort(shortId, shortData) {
    const { $updateItem } = useNuxtApp()

    try {
      const short = await updateItem('shorts', shortId, shortData)
      return short;
    } catch (error) {
      console.error('Error updating short:', error);
      throw error;
    }
}
  