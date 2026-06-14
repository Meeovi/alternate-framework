// composables/deleteShort.js

export default async function deleteShort(shortId) {
    const { $deleteItem } = useNuxtApp()

    try {
      await deleteItem('shorts', shortId)
      console.log('Short deleted successfully');
    } catch (error) {
      console.error('Error deleting short:', error);
      throw error;
    }
}
  