
export function useLists() {
  const { $readItems } = useNuxtApp()

  const getList = async (id: string | number, options?: Record<string, any>) => {
    return await readItem('lists', id, options) || null
  }

  const listLists = async (options?: Record<string, any>) => {
    const result = await readItems('lists', options)
    return Array.isArray(result) ? result : []
  }

  const createList = async (payload: Record<string, any>) => {
    return await createItem('lists', payload) || null
  }

  const updateList = async (id: string | number, payload: Record<string, any>) => {
    return await updateItem('lists', id, payload) || null
  }

  const deleteList = async (id: string | number) => {
    return await deleteItem('lists', id) || null
  }

  const addItem = async (payload: Record<string, any>) => {
    return await createItem('list_items', payload) || null
  }

  const updateListItem = async (id: string | number, payload: Record<string, any>) => {
    return await updateItem('list_items', id, payload) || null
  }

  const updateItemInList = updateListItem

  const deleteListItem = async (id: string | number) => {
    return await deleteItem('list_items', id) || null
  }

  const removeFromList = deleteListItem

  const reorderItems = async (items: Array<Record<string, any>>) => {
    await Promise.all(
      items.map((item, index) => updateListItem(item.id, { sort: index + 1 })),
    )
  }

  return {
    getList,
    listLists,
    createList,
    updateList,
    deleteList,
    addItem,
    updateItem: updateItemInList,
    updateListItem,
    deleteItem: deleteListItem,
    removeFromList,
    reorderItems,
  }
}
