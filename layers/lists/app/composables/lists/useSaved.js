export const useSaved = () => {
    const content = useContentAdapter()
    const nuxt = typeof useNuxtApp !== 'undefined' ? useNuxtApp() : (globalThis && globalThis.__NUXT_APP) || {}
    const user = useSupabaseUser()

    const isSaved = async (productId) => {
      if (!user.value) return false

      // fetch user's lists
      let lists = []
      try {
        if (content && typeof content.readItems === 'function') {
          const resp = await content.readItems('lists', { filter: { user: { _eq: user.value.id } }, fields: ['id'] })
          lists = resp?.data || resp || []
        } else {
          const { $directus } = nuxt
          const resp = await $directus.items('lists').readItems({ filter: { user: { _eq: user.value.id } }, fields: ['id'] })
          lists = resp || []
        }
      } catch (e) {
        console.error('Error fetching user lists', e)
        return false
      }

      const listIds = lists.map((l) => l.id)
      if (listIds.length === 0) return false

      try {
        if (content && typeof content.readItems === 'function') {
          const resp = await content.readItems('list_items', { filter: { list: { _in: listIds }, product: { _eq: productId } } })
          const saved = resp?.data || resp || []
          return saved.length > 0
        }
        const { $directus } = nuxt
        const saved = await $directus.items('list_items').readItems({ filter: { list: { _in: listIds }, product: { _eq: productId } } })
        return saved.length > 0
      } catch (e) {
        console.error('Error checking saved product', e)
        return false
      }
    }

    return { isSaved }
  };
  