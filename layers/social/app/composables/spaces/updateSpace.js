// composables/updatePost.js

export default async function updatePost(spaceId, spaceData) {
    const { $updateItem } = useNuxtApp()

    try {
      const space = await updateItem('spaces', spaceId, spaceData)
      return space;
    } catch (error) {
      console.error('Error updating space:', error);
      throw error;
    }
}
  