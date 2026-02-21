// composables/cms/lists/deleteList.js
import { deleteItem } from '@directus/sdk';

export default async function deleteList(listId) {
    const content = useContentAdapter()
    const nuxt = typeof useNuxtApp !== 'undefined' ? useNuxtApp() : (globalThis && globalThis.__NUXT_APP) || {}

    try {
        if (content && typeof content.deleteItem === 'function') {
            await content.deleteItem('lists', listId)
            return true
        }
        const { $directus, $deleteItem } = nuxt
        await $directus.request($deleteItem('lists', listId))
        return true
    } catch (error) {
        console.error('Error deleting list:', error)
        throw error
    }
}
