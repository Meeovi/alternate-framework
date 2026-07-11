import { backend } from './backend'

export const search = {
  query: (source: string, params: any) =>
    backend.search(source, params),

  items: (source: string, params?: any) =>
    backend.readItems(source, params)
}