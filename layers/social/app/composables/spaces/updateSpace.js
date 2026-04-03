// composables/updatePost.js
import useAdapterRequest from '#social/app/composables/core/useAdapterRequest'

export default async function updatePost(spaceId, spaceData) {
    const { updateItem } = useAdapterRequest()

    try {
      const space = await updateItem('spaces', spaceId, spaceData)
      return space;
    } catch (error) {
      console.error('Error updating space:', error);
      throw error;
    }
}
  