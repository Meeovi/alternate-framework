// composables/deleteSpace.js

export default async function deleteSpace(spaceId) {
    const { $directus, $deleteItem } = useNuxtApp()

    try {
      await $directus.request($deleteItem('spaces', spaceId))
      console.log('Space deleted successfully');
    } catch (error) {
      console.error('Error deleting space:', error);
      throw error;
    }
}
