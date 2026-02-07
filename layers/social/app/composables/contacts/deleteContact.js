// composables/deleteContact.js
import useAdapterRequest from '~/composables/useAdapterRequest'

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
  