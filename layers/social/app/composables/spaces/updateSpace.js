// composables/updatePost.js

export default async function updatePost(spaceId, spaceData) {
    const { $directus, $updateItem } = useNuxtApp()

    try {
      const space = await $directus.request($updateItem('spaces', spaceId, spaceData))
      return space;
    } catch (error) {
      console.error('Error updating space:', error);
      throw error;
    }
}
