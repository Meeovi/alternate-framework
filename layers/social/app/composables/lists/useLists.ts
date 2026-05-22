
export function useLists() {
  const {
    readItem,
    readItems,
    createItem,
    updateItem,
    deleteItem,
  } = useSdkContentAdapter()

  const getList = async (id: string | number, options?: Record<string, any>) => {
    const resp = await readItem('lists', id, options)
    return resp?.data || resp || null
  }

  const listLists = async (options?: Record<string, any>) => {
    const resp = await readItems('lists', options)
    return resp?.data || resp || []
  }

  const createList = async (payload: Record<string, any>) => {
    const resp = await createItem('lists', payload)
    return resp?.data || resp || null
  }

  const updateList = async (id: string | number, payload: Record<string, any>) => {
    const resp = await updateItem('lists', id, payload)
    return resp?.data || resp || null
  }

  const deleteList = async (id: string | number) => {
    const resp = await deleteItem('lists', id)
    return resp?.data || resp || null
  }

  const addItem = async (payload: Record<string, any>) => {
    const resp = await createItem('list_items', payload)
    return resp?.data || resp || null
  }

  const updateListItem = async (id: string | number, payload: Record<string, any>) => {
    const resp = await updateItem('list_items', id, payload)
    return resp?.data || resp || null
  }

  const updateItemInList = updateListItem

  const deleteListItem = async (id: string | number) => {
    const resp = await deleteItem('list_items', id)
    return resp?.data || resp || null
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