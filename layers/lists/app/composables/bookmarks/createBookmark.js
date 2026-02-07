// composables/createWebsite.js
import { getListProvider } from '../registry'
import { useLists } from '../useLists'

export default async function createWebsite(websiteData) {
  const route = useRoute()
  const id = route.params.id
  const provider = getListProvider()

  try {
    // If a provider is registered and implements website creation, use it
    if (provider && typeof provider.createWebsite === 'function') {
      return await provider.createWebsite(websiteData, { route, id })
    }

    // Prefer Nuxt's directus instance if available
    const nuxt = useNuxtApp()
    if (nuxt && nuxt.$directus) {
      // Try common SDK surface without importing the SDK directly
      if (typeof nuxt.$directus.items === 'function') {
        return await nuxt.$directus.items('websites').create({
          name: websiteData.name,
          note: websiteData.note,
          status: websiteData.status,
          type: websiteData.type,
          image: websiteData.image,
          icon: websiteData.icon,
          slug: websiteData.slug,
          coverFile: null,
          username: websiteData.username
        })
      }
      if (typeof nuxt.$directus.request === 'function') {
        // Best-effort: let the runtime handle request shape
        return await nuxt.$directus.request({
          method: 'POST',
          path: '/items/websites',
          body: {
            name: websiteData.name,
            note: websiteData.note,
            status: websiteData.status,
            type: websiteData.type,
            image: websiteData.image,
            icon: websiteData.icon,
            slug: websiteData.slug,
            coverFile: null,
            username: websiteData.username
          }
        })
      }
    }

    // Fallback to lists provider in-memory implementation
    const { createList } = useLists()
    return await createList({
      name: websiteData.name,
      description: websiteData.note,
      type: 'website',
      visibility: websiteData.status || 'private'
    })
  } catch (error) {
    console.error('Error creating website:', error)
    throw error
  }
}
