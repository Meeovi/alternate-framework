// composables/deleteSpace.js
import useAdapterRequest from '~/composables/useAdapterRequest'

export default async function deleteSpace(spaceId) {
    const { deleteItem } = useAdapterRequest()

    try {
      await deleteItem('spaces', spaceId)
      console.log('Space deleted successfully');
    } catch (error) {
      console.error('Error deleting space:', error);
      throw error;
    }
}
  