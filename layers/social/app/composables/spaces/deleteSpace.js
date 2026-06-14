// composables/deleteSpace.js

export default async function deleteSpace(spaceId) {
    const { $deleteItem } = useNuxtApp()

    try {
      await deleteItem('spaces', spaceId)
      console.log('Space deleted successfully');
    } catch (error) {
      console.error('Error deleting space:', error);
      throw error;
    }
}
  