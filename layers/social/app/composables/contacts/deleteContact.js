// composables/deleteContact.js

export default async function deleteContact(contactId) {
    const { $deleteItem } = useNuxtApp()

    try {
      await deleteItem('contacts', contactId)
      console.log('Contact deleted successfully');
    } catch (error) {
      console.error('Error deleting contact:', error);
      throw error;
    }
}
  