import { getListProvider } from './registry'

const createMemoryProvider = () => {
  const lists = []

  return {
    async createList(payload) {
      const id = Date.now().toString()
      const list = { id, ...payload, items: [] }
      lists.push(list)
      return list
    },

    async addToList(listId, item) {
      const list = lists.find((l) => l.id == listId)
      if (!list) throw new Error('List not found')
      const itemId = Date.now().toString()
      const stored = { id: itemId, ...item }
      list.items.push(stored)
      return stored
    },

    async getUserLists(type) {
      if (!type) return lists
      return lists.filter((l) => l.type === type)
    },

    async removeFromList(itemId) {
      for (const l of lists) {
        const idx = l.items.findIndex((i) => i.id == itemId)
        if (idx > -1) {
          l.items.splice(idx, 1)
          return true
        }
      }
      return false
    },

    async updateListItem(itemId, patch) {
      for (const l of lists) {
        const it = l.items.find((i) => i.id == itemId)
        if (it) {
          Object.assign(it, patch)
          return it
        }
      }
      throw new Error('Item not found')
    }
  }
}

export const useLists = () => {
  const provider = getListProvider()

  if (provider && typeof provider.createList === 'function') {
    return provider
  }

  // Fallback to an in-memory provider
  const memory = createMemoryProvider()
  return memory
}
