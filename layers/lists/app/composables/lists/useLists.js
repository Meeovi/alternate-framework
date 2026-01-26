import { createItem, readItems, readItem, updateItem, deleteItem } from '@directus/sdk'

export const useLists = () => {
  const { $directus, $readItem } = useNuxtApp()

  // Cache current user to avoid repeated requests
  let _currentUser = null

  async function ensureCurrentUser() {
    if (_currentUser) return _currentUser
    try {
      const resp = await $directus.request($readItem('users', 'me'))
      // Directus responses sometimes wrap in { data } or return raw object
      _currentUser = resp?.data || resp || null
      return _currentUser
    } catch (e) {
      return null
    }
  }

  const createList = async (listData) => {
    const user = await ensureCurrentUser()
    if (!user) throw new Error('Not logged in')

    const list = await $directus.request(
      createItem('lists', {
        ...listData,
        user_created: user.id,
        date_created: new Date().toISOString()
      })
    )
    return list
  }

  const updateList = async (listId, updates) => {
    return await $directus.request(
      updateItem('lists', listId, {
        ...updates,
        date_updated: new Date().toISOString()
      })
    )
  }

  const deleteList = async (listId) => {
    return await $directus.request(deleteItem('lists', listId))
  }

  const getUserLists = async (type = null) => {
    const user = await ensureCurrentUser()
    if (!user) return []

    const filter = { user_created: { _eq: user.id } }
    if (type) filter.type = { _eq: type }

    return await $directus.request(
      readItems('lists', {
        filter,
        sort: ['-date_updated', 'name'],
        fields: ['*', 'items.*', 'items.content.*']
      })
    )
  }

  const getPublicLists = async (type = null) => {
    const filter = { visibility: { _eq: 'public' } }
    if (type) filter.type = { _eq: type }

    return await $directus.request(
      readItems('lists', {
        filter,
        sort: ['-date_updated'],
        fields: ['*', 'user_created.first_name', 'user_created.last_name']
      })
    )
  }

  const getListById = async (listId) => {
    return await $directus.request(
      readItem('lists', listId, {
        fields: ['*', 'items.*', 'items.content.*', 'user_created.first_name', 'user_created.last_name']
      })
    )
  }

  const addToList = async (listId, contentData) => {
    return await $directus.request(
      createItem('list_items', {
        list: listId,
        content: contentData,
        date_created: new Date().toISOString()
      })
    )
  }

  const removeFromList = async (itemId) => {
    return await $directus.request(deleteItem('list_items', itemId))
  }

  const updateListItem = async (itemId, updates) => {
    return await $directus.request(
      updateItem('list_items', itemId, {
        ...updates,
        date_updated: new Date().toISOString()
      })
    )
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
  