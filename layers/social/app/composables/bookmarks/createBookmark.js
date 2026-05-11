// composables/createWebsite.js
import { getListProvider } from '../registry'
import { useLists } from '../useLists'

export default async function createWebsite(websiteData) {
  const route = useRoute()
  const id = route.params.id
  const provider = getListProvider()
  const content = useContentAdapter()

  try {
    // If a provider is registered and implements website creation, use it
    if (provider && typeof provider.createWebsite === 'function') {
      return await provider.createWebsite(websiteData, { route, id })
    }

    if (content && typeof content.createItem === 'function') {
      const resp = await content.createItem('websites', {
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
      return resp?.data || resp
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
