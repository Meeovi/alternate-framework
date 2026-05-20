// composables/deleteContact.js
import { useSdkContentAdapter } from '#imports'
export default async function deleteContact(contactId) {
    const { deleteItem } = useSdkContentAdapter()

    try {
      await deleteItem('contacts', contactId)
      console.log('Contact deleted successfully');
    } catch (error) {
      console.error('Error deleting contact:', error);
      throw error;
    }
}
  