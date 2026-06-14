// composables/updateContact.js

export default async function updateContact(contactId, contactData) {
    const { $updateItem } = useNuxtApp()

    try {
      const contact = await updateItem('contacts', contactId, contactData)
      return contact;
    } catch (error) {
      console.error('Error updating contact:', error);
      throw error;
    }
}
  