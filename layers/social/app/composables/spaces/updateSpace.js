// composables/updatePost.js
import { useSdkContentAdapter } from '#imports'
export default async function updatePost(spaceId, spaceData) {
    const { updateItem } = useSdkContentAdapter()

    try {
      const space = await updateItem('spaces', spaceId, spaceData)
      return space;
    } catch (error) {
      console.error('Error updating space:', error);
      throw error;
    }
}
  