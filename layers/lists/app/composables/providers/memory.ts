import { registerListsProvider } from '../registry'
import type { List, ListItem, ListsProvider } from '../types'
import { nanoid } from 'nanoid'

const lists = new Map<string, List>()

const MemoryListsProvider: ListsProvider = {
  async getList(id) {
    const list = lists.get(id)
    if (!list) throw new Error(`List ${id} not found`)
    return list
  },

  async listLists() {
    return Array.from(lists.values())
  },

  async createList(data) {
    const id = nanoid()
    const list: List = {
      id,
      title: data.title || 'Untitled List',
      type: data.type || 'list',
      items: [],
      metadata: data.metadata || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    lists.set(id, list)
    return list
  },

  async updateList(id, data) {
    const list = await this.getList(id)
    const updated = {
      ...list,
      ...data,
      updatedAt: new Date().toISOString()
    }
    lists.set(id, updated)
    return updated
  },

  async deleteList(id) {
    lists.delete(id)
  },

  async addItem(listId, item) {
    const list = await this.getList(listId)
    const newItem: ListItem = {
      id: nanoid(),
      title: item.title || '',
      description: item.description,
      completed: item.completed || false,
      position: list.items.length,
      parentId: item.parentId,
      metadata: item.metadata || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    list.items.push(newItem)
    return newItem
  },

  async updateItem(listId, itemId, data) {
    const list = await this.getList(listId)
    const item = list.items.find(i => i.id === itemId)
    if (!item) throw new Error(`Item ${itemId} not found`)
    Object.assign(item, data, { updatedAt: new Date().toISOString() })
    return item
  },

  async deleteItem(listId, itemId) {
    const list = await this.getList(listId)
    list.items = list.items.filter(i => i.id !== itemId)
  },

  async reorderItems(listId, itemIds) {
    const list = await this.getList(listId)
    const newOrder = itemIds.map(id => list.items.find(i => i.id === id)!)
    list.items = newOrder.map((item, index) => ({
      ...item,
      position: index
    }))
  }
}

registerListsProvider('memory', MemoryListsProvider)