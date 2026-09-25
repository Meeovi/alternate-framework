import { backend, executeDataSource } from './backend'

type ContentResult<T = any> = {
  ok: boolean
  data?: T
  error?: string
}

export const content = {
  readItem: (source: string, id: string): Promise<ContentResult> =>
    backend.readItem(source, id),

  readItems: (source: string, params?: any): Promise<ContentResult> =>
    backend.readItems(source, params),

  createItem: (source: string, item: any): Promise<ContentResult> =>
    backend.createItem(source, item),

  updateItem: (source: string, id: string, item: any): Promise<ContentResult> =>
    backend.updateItem(source, id, item),

  deleteItem: (source: string, id: string): Promise<ContentResult> =>
    backend.deleteItem(source, id),

  search: (source: string, params: any): Promise<ContentResult> =>
    backend.search(source, params),

  async get(source: string, path: string, opts?: {
    method?: string
    query?: Record<string, any>
    body?: any
    headers?: Record<string, string>
  }): Promise<ContentResult> {
    return executeDataSource(source, path, opts)
  }
}