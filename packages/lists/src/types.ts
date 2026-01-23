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
}