// composables/updatePost.js
import useContent from '#shared/app/composables/content/useContent'
export default async function updatePost(spaceId, spaceData) {
    const { updateItem } = useContent()

    try {
      const space = await updateItem('spaces', spaceId, spaceData)
      return space;
    } catch (error) {
      console.error('Error updating space:', error);
      throw error;
    }
}
  