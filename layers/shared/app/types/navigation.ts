export interface Page {
  id?: string
  permalink?: string
  [key: string]: any
}

export interface NavigationItem {
  type: 'page' | 'url' | string
  page?: Page | string
  url?: string
  [key: string]: any
}
