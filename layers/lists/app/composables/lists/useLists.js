export const useLists = () => {
  const content = useContentAdapter()
  const nuxt = typeof useNuxtApp !== 'undefined' ? useNuxtApp() : (globalThis && globalThis.__NUXT_APP) || {}

  // Cache current user to avoid repeated requests
  let _currentUser = null

  async function ensureCurrentUser() {
    if (_currentUser) return _currentUser
    try {
      if (content && typeof content.readItem === 'function') {
        const resp = await content.readItem('users', 'me')
        _currentUser = resp?.data || resp || null
        return _currentUser
      }
    } catch (e) {
      // ignore and fallback
    }
    try {
      const { $directus, $readItem } = nuxt
      if ($directus && typeof $directus.request === 'function') {
        const resp = await $directus.request($readItem('users', 'me'))
        _currentUser = resp?.data || resp || null
        return _currentUser
      }
    } catch (e) {
      return null
    }
    return null
  }

  const createList = async (listData) => {
    const user = await ensureCurrentUser()
    if (!user) throw new Error('Not logged in')

    const payload = {
      ...listData,
      user_created: user.id,
      date_created: new Date().toISOString()
    }

    if (content && typeof content.createItem === 'function') {
      const resp = await content.createItem('lists', payload)
      return resp?.data || resp
    }

    // fallback
    const { $directus, $createItem } = nuxt
    return await $directus.request($createItem('lists', payload))
  }

  const updateList = async (listId, updates) => {
    const payload = { ...updates, date_updated: new Date().toISOString() }
    if (content && typeof content.updateItem === 'function') {
      const resp = await content.updateItem('lists', listId, payload)
      return resp?.data || resp
    }
    const { $directus, $updateItem } = nuxt
    return await $directus.request($updateItem('lists', listId, payload))
  }

  const deleteList = async (listId) => {
    if (content && typeof content.deleteItem === 'function') {
      await content.deleteItem('lists', listId)
      return true
    }
    const { $directus, $deleteItem } = nuxt
    await $directus.request($deleteItem('lists', listId))
    return true
  }

  const getUserLists = async (type = null) => {
    const user = await ensureCurrentUser()
    if (!user) return []
    const filter = { user_created: { _eq: user.id } }
    if (type) filter.type = { _eq: type }
    const opts = { filter, sort: ['-date_updated', 'name'], fields: ['*', 'items.*', 'items.content.*'] }
    if (content && typeof content.readItems === 'function') {
      const resp = await content.readItems('lists', opts)
      return resp?.data || resp || []
    }
    const { $directus, $readItems } = nuxt
    return await $directus.request($readItems('lists', opts))
  }

  const getPublicLists = async (type = null) => {
    const filter = { visibility: { _eq: 'public' } }
    if (type) filter.type = { _eq: type }
    const opts = { filter, sort: ['-date_updated'], fields: ['*', 'user_created.first_name', 'user_created.last_name'] }
    if (content && typeof content.readItems === 'function') {
      const resp = await content.readItems('lists', opts)
      return resp?.data || resp || []
    }
    const { $directus, $readItems } = nuxt
    return await $directus.request($readItems('lists', opts))
  }

  const getListById = async (listId) => {
    const opts = { fields: ['*', 'items.*', 'items.content.*', 'user_created.first_name', 'user_created.last_name'] }
    if (content && typeof content.readItem === 'function') {
      const resp = await content.readItem('lists', listId, opts)
      return resp?.data || resp
    }
    const { $directus, $readItem } = nuxt
    return await $directus.request($readItem('lists', listId, opts))
  }

  const addToList = async (listId, contentData) => {
    const payload = { list: listId, content: contentData, date_created: new Date().toISOString() }
    if (content && typeof content.createItem === 'function') {
      const resp = await content.createItem('list_items', payload)
      return resp?.data || resp
    }
    const { $directus, $createItem } = nuxt
    return await $directus.request($createItem('list_items', payload))
  }

  const removeFromList = async (itemId) => {
    if (content && typeof content.deleteItem === 'function') {
      await content.deleteItem('list_items', itemId)
      return true
    }
    const { $directus, $deleteItem } = nuxt
    await $directus.request($deleteItem('list_items', itemId))
    return true
  }

  const updateListItem = async (itemId, updates) => {
    const payload = { ...updates, date_updated: new Date().toISOString() }
    if (content && typeof content.updateItem === 'function') {
      const resp = await content.updateItem('list_items', itemId, payload)
      return resp?.data || resp
    }
    const { $directus, $updateItem } = nuxt
    return await $directus.request($updateItem('list_items', itemId, payload))
  }

  return {
    createList,
    updateList,
    deleteList,
    getUserLists,
    getPublicLists,
    getListById,
    addToList,
    removeFromList,
    updateListItem
  }
}
  