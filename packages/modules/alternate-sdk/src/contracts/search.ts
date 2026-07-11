
export interface ProxyContract {
  search: SearchContract
}

export interface SearchContract {
  search(query: string, options?: any): Promise<any[]>
  suggest(query: string): Promise<string[]>
  index(doc: any): Promise<void>
  stats(): Promise<any>
  clear(): Promise<void>
  getAdapter(): () => SearchAdapter
}

export interface SearchAdapter {
  search(query: string, options?: any): Promise<any[]>
  suggest(query: string): Promise<string[]>
  index(doc: any): Promise<void>
  stats(): Promise<any>
  clear(): Promise<void>
}

const searchRegistry = new Map<string, SearchAdapter>()
let defaultSearchAdapter: SearchAdapter | undefined

export function registerSearchAdapter(name: string, adapter: SearchAdapter): void {
  searchRegistry.set(name, adapter)
}

export function getSearchAdapter(name?: string): SearchAdapter | undefined {
  if (name) return searchRegistry.get(name)
  return defaultSearchAdapter
}

export function setDefaultSearchAdapter(adapter: SearchAdapter): void {
  defaultSearchAdapter = adapter
}

export const SearchAdapterRegistry = {
  register: registerSearchAdapter,
  get: getSearchAdapter,
  getDefaultAdapter: () => defaultSearchAdapter,
  setDefaultAdapter: setDefaultSearchAdapter,
}

