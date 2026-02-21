export interface ListItem {
  id: string
  title: string
  description?: string
  completed?: boolean
  position?: number
  parentId?: string
  metadata?: Record<string, any>
  createdAt?: string
  updatedAt?: string
}

export interface List {
  id: string
  title: string
  type: 'checklist' | 'kanban' | 'list' | string
  items: ListItem[]
  metadata?: Record<string, any>
  createdAt?: string
  updatedAt?: string
}

export interface ListsProvider {
  getList(id: string): Promise<List>
  listLists(params?: Record<string, any>): Promise<List[]>
  createList(data: Partial<List>): Promise<List>
  updateList(id: string, data: Partial<List>): Promise<List>
  deleteList(id: string): Promise<void>

  addItem(listId: string, item: Partial<ListItem>): Promise<ListItem>
  updateItem(listId: string, itemId: string, data: Partial<ListItem>): Promise<ListItem>
  deleteItem(listId: string, itemId: string): Promise<void>

  reorderItems?(listId: string, itemIds: string[]): Promise<void>

  // Optional advanced features commonly found in task apps
  toggleComplete?(listId: string, itemId: string, completed: boolean): Promise<ListItem>
  setDueDate?(listId: string, itemId: string, dueDate: string | null): Promise<ListItem>
  setReminder?(listId: string, itemId: string, reminder: string | null): Promise<ListItem>
  setPriority?(listId: string, itemId: string, priority: number | null): Promise<ListItem>
  shareList?(listId: string, userId: string, role?: string): Promise<void>
  searchItems?(listId: string, query: string): Promise<ListItem[]>
  archiveList?(listId: string): Promise<void>
}

export interface ContentAdapter {
  readItem(collection: string, id: any, opts?: Record<string, any>): Promise<any>
  readItems(collection: string, opts?: Record<string, any>): Promise<any>
  createItem(collection: string, data: any): Promise<any>
  updateItem(collection: string, id: any, data: any): Promise<any>
  deleteItem(collection: string, id: any): Promise<any>
}