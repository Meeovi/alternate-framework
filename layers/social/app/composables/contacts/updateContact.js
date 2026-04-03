// composables/updateContact.js
import useAdapterRequest from '#social/app/composables/core/useAdapterRequest'

export default async function updateContact(contactId, contactData) {
    const { updateItem } = useAdapterRequest()

    try {
      const contact = await updateItem('contacts', contactId, contactData)
      return contact;
    } catch (error) {
      console.error('Error updating contact:', error);
      throw error;
    }
}
  