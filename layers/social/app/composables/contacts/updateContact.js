// composables/updateContact.js
import useContent from '#shared/app/composables/content/useContent'
export default async function updateContact(contactId, contactData) {
    const { updateItem } = useContent()

    try {
      const contact = await updateItem('contacts', contactId, contactData)
      return contact;
    } catch (error) {
      console.error('Error updating contact:', error);
      throw error;
    }
}
  