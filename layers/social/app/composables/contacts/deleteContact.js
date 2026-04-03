// composables/deleteContact.js
import useAdapterRequest from '#social/app/composables/core/useAdapterRequest'

export default async function deleteContact(contactId) {
    const { deleteItem } = useAdapterRequest()

    try {
      await deleteItem('contacts', contactId)
      console.log('Contact deleted successfully');
    } catch (error) {
      console.error('Error deleting contact:', error);
      throw error;
    }
}
  