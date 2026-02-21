// composables/createList.js
import { createItem } from '@directus/sdk';

export default async function createList(listData) {
  const content = useContentAdapter()
  const nuxt = typeof useNuxtApp !== 'undefined' ? useNuxtApp() : (globalThis && globalThis.__NUXT_APP) || {}
  const user = useSupabaseUser()

  const data = {
    name: listData.name,
    type: listData.type,
    status: listData.status,
    description: listData.description,
    image: listData.image,
    user: user.value?.id,
  }

  try {
    if (content && typeof content.createItem === 'function') {
      const resp = await content.createItem('lists', data)
      return resp?.data || resp
    }
    const { $directus, $createItem } = nuxt
    return await $directus.request($createItem('lists', data))
  } catch (error) {
    console.error('Error creating list:', error)
    throw error
  }
}
  