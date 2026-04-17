import type {
    BaseAdapter,
    BaseAdapterConfig
} from './common';

export interface ListsAdapterConfig extends BaseAdapterConfig {
  provider?: string
}

export interface ListsAdapter extends BaseAdapter<ListsAdapterConfig> {
  type: 'lists'

  getList(id: string): Promise<any>
  listLists(params?: Record<string, any>): Promise<any[]>
  createList(data: Partial<any>): Promise<any>
  updateList(id: string, data: Partial<any>): Promise<any>
  deleteList(id: string): Promise<void>

  addItem(listId: string, item: Partial<any>): Promise<any>
  updateItem(listId: string, itemId: string, data: Partial<any>): Promise<any>
  deleteItem(listId: string, itemId: string): Promise<void>

  reorderItems?(listId: string, itemIds: string[]): Promise<void>
}

export default ListsAdapter
