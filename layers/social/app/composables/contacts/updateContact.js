// composables/updateContact.js
import { useSdkContentAdapter } from '#imports'
export default async function updateContact(contactId, contactData) {
    const { updateItem } = useSdkContentAdapter()

    try {
      const contact = await updateItem('contacts', contactId, contactData)
      return contact;
    } catch (error) {
      console.error('Error updating contact:', error);
      throw error;
    }
}
  