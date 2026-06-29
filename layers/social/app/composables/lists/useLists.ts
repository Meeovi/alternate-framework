// layers/social/composables/useLists.ts

import { useNuxtApp } from 'nuxt/app'

/**
 * Core list types + plugin‑extensible registry
 */
export type ListType =
  | 'basic'
  | 'todo'
  | 'shopping'
  | 'project'
  | 'habit'
  | 'smart'
  | string // plugins can add new types

/**
 * Plugin registry for list types
 */
export const listTypeRegistry: Record<
  string,
  {
    label: string
    icon?: string
    color?: string
    fields?: string[] // extra fields plugins want to add to list_items
  }
> = {
  basic: { label: 'Basic List', icon: 'mdi-format-list-bulleted', color: '#607D8B' },
  todo: { label: 'To‑Do List', icon: 'mdi-checkbox-marked-outline', color: '#4CAF50' },
  shopping: { label: 'Shopping List', icon: 'mdi-cart', color: '#FF9800', fields: ['quantity'] },
  project: { label: 'Project Board', icon: 'mdi-view-kanban', color: '#3F51B5', fields: ['status'] },
  habit: { label: 'Habit Tracker', icon: 'mdi-repeat', color: '#9C27B0', fields: ['streak'] },
  smart: { label: 'Smart List', icon: 'mdi-lightbulb-on-outline', color: '#009688' }
}

/**
 * Allow plugins to register new list types
 */
export function registerListType(
  type: string,
  config: {
    label: string
    icon?: string
    color?: string
    fields?: string[]
  }
) {
  listTypeRegistry[type] = config
}

/**
 * Allow plugins to register new item fields
 */
export const listItemFieldRegistry: Set<string> = new Set([
  'title',
  'notes',
  'priority',
  'dueDate',
  'reminderAt',
  'recurrence',
  'parentId',
  'sort',
  'completed',
  'quantity',
  'status',
  'streak'
])

export function registerListItemField(field: string) {
  listItemFieldRegistry.add(field)
}

/**
 * Main composable
 */
export function useLists() {
  const { $sdk } = useNuxtApp() as any

  // -----------------------------
  // LISTS
  // -----------------------------

  const getList = async (id: string | number, options?: Record<string, any>) => {
    return await $sdk.content.readItem('lists', id, options) || null
  }

  const listLists = async (options?: Record<string, any>) => {
    const result = await $sdk.content.readItems('lists', options)
    return Array.isArray(result) ? result : []
  }

  const createList = async (payload: {
    name: string
    type?: ListType
    color?: string
    icon?: string
    userId?: string | number
  }) => {
    const type = payload.type || 'basic'
    const config = listTypeRegistry[type]

    return await $sdk.content.createItem('lists', {
      ...payload,
      type,
      color: payload.color || config?.color,
      icon: payload.icon || config?.icon
    }) || null
  }

  const updateList = async (id: string | number, payload: Record<string, any>) => {
    return await $sdk.content.updateItem('lists', id, payload) || null
  }

  const deleteList = async (id: string | number) => {
    return await $sdk.content.deleteItem('lists', id) || null
  }

  // -----------------------------
  // LIST ITEMS (TASKS)
  // -----------------------------

  const addItem = async (payload: Record<string, any>) => {
    const safePayload: Record<string, any> = {}

    for (const key of Object.keys(payload)) {
      if (listItemFieldRegistry.has(key)) safePayload[key] = payload[key]
    }

    return await $sdk.content.createItem('list_items', {
      completed: false,
      ...safePayload
    }) || null
  }

  const updateListItem = async (id: string | number, payload: Record<string, any>) => {
    const safePayload: Record<string, any> = {}

    for (const key of Object.keys(payload)) {
      if (listItemFieldRegistry.has(key)) safePayload[key] = payload[key]
    }

    return await $sdk.content.updateItem('list_items', id, safePayload) || null
  }

  const deleteListItem = async (id: string | number) => {
    return await $sdk.content.deleteItem('list_items', id) || null
  }

  const reorderItems = async (items: Array<{ id: string | number }>) => {
    await Promise.all(
      items.map((item, index) =>
        updateListItem(item.id, { sort: index + 1 })
      )
    )
  }

  // -----------------------------
  // SUBTASKS
  // -----------------------------

  const addSubtask = async (parentId: string | number, payload: any) => {
    return addItem({ ...payload, parentId })
  }

  const listSubtasks = async (parentId: string | number) => {
    const result = await $sdk.content.readItems('list_items', {
      filter: { parentId: { _eq: parentId } },
      sort: ['sort']
    })
    return Array.isArray(result) ? result : []
  }

  // -----------------------------
  // SMART LISTS
  // -----------------------------

  const listToday = async (userId: string | number) => {
    const today = new Date().toISOString().split('T')[0]

    const result = await $sdk.content.readItems('list_items', {
      filter: {
        userId: { _eq: userId },
        dueDate: { _eq: today }
      },
      sort: ['sort']
    })

    return Array.isArray(result) ? result : []
  }

  const listUpcoming = async (userId: string | number) => {
    const today = new Date().toISOString().split('T')[0]

    const result = await $sdk.content.readItems('list_items', {
      filter: {
        userId: { _eq: userId },
        dueDate: { _gt: today }
      },
      sort: ['dueDate', 'sort']
    })

    return Array.isArray(result) ? result : []
  }

  const listStarred = async (userId: string | number) => {
    const result = await $sdk.content.readItems('list_items', {
      filter: {
        userId: { _eq: userId },
        priority: { _eq: 'high' }
      },
      sort: ['sort']
    })

    return Array.isArray(result) ? result : []
  }

  // -----------------------------
  // MOVE ITEMS BETWEEN LISTS
  // -----------------------------

  const moveItemToList = async (
    itemId: string | number,
    newListId: string | number
  ) => {
    return updateListItem(itemId, { listId: newListId })
  }

  // -----------------------------
  // COMPLETE / UNCOMPLETE
  // -----------------------------

  const completeItem = async (id: string | number) => {
    return updateListItem(id, { completed: true })
  }

  const uncompleteItem = async (id: string | number) => {
    return updateListItem(id, { completed: false })
  }

  return {
    // lists
    getList,
    listLists,
    createList,
    updateList,
    deleteList,

    // items
    addItem,
    updateListItem,
    deleteListItem,
    reorderItems,

    // subtasks
    addSubtask,
    listSubtasks,

    // smart lists
    listToday,
    listUpcoming,
    listStarred,

    // move
    moveItemToList,

    // complete
    completeItem,
    uncompleteItem
  }
}
