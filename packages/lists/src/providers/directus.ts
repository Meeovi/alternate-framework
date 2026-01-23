import { registerListsProvider } from '../registry'
import type { ListsProvider } from '../types'
import { fetcher } from '@meeovi/api'

const DirectusListsProvider: ListsProvider = {
  async getList(id) {
    const { data } = await fetcher('lists.GET_LIST', { id })
    return data.list
  },

  async listLists() {
    const { data } = await fetcher('lists.LIST_LISTS')
    return data.lists
  },

  async createList(data) {
    const { data: result } = await fetcher('lists.CREATE_LIST', { data })
    return result.list
  },

  async updateList(id, data) {
    const { data: result } = await fetcher('lists.UPDATE_LIST', { id, data })
    return result.list
  },

  async deleteList(id) {
    await fetcher('lists.DELETE_LIST', { id })
  },

  async addItem(listId, item) {
    const { data } = await fetcher('lists.ADD_ITEM', { listId, item })
    return data.item
  },

  async updateItem(listId, itemId, data) {
    const { data: result } = await fetcher('lists.UPDATE_ITEM', { listId, itemId, data })
    return result.item
  },

  async deleteItem(listId, itemId) {
    await fetcher('lists.DELETE_ITEM', { listId, itemId })
  },

  async reorderItems(listId, itemIds) {
    await fetcher('lists.REORDER_ITEMS', { listId, itemIds })
  }
}

registerListsProvider('directus', DirectusListsProvider)