// composables/deleteSpace.js
import useContent from '#shared/app/composables/content/useContent'
export default async function deleteSpace(spaceId) {
    const { deleteItem } = useContent()

    try {
      await deleteItem('spaces', spaceId)
      console.log('Space deleted successfully');
    } catch (error) {
      console.error('Error deleting space:', error);
      throw error;
    }
}
  