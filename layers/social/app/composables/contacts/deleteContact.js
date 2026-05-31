// composables/deleteContact.js
import useContent from '#shared/app/composables/content/useContent'
export default async function deleteContact(contactId) {
    const { deleteItem } = useContent()

    try {
      await deleteItem('contacts', contactId)
      console.log('Contact deleted successfully');
    } catch (error) {
      console.error('Error deleting contact:', error);
      throw error;
    }
}
  