export interface ContentItem {
  id: string
  title: string
  body: any
  slug?: string
  [key: string]: any
}

export interface ContentProvider {
  getContent(slug: string): Promise<ContentItem>
  listContent(params?: Record<string, any>): Promise<ContentItem[]>
}
