// composables/updateList.js
import { updateItem } from '@directus/sdk';

export default async function updateList(listId, listData) {
  const content = useContentAdapter()
  const nuxt = typeof useNuxtApp !== 'undefined' ? useNuxtApp() : (globalThis && globalThis.__NUXT_APP) || {}

  try {
    if (content && typeof content.updateItem === 'function') {
      const resp = await content.updateItem('lists', listId, listData)
      return resp?.data || resp
    }
    const { $directus, $updateItem } = nuxt
    return await $directus.request($updateItem('lists', listId, listData))
  } catch (error) {
    console.error('Error updating list:', {
      error: error.message,
      statusCode: error.status,
      data: error.data,
      listId,
      listData
    })
    throw error
  }
}
