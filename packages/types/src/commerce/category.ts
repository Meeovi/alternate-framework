export interface CommerceCategory {
  id: string
  slug: string
  name: string
  parentId?: string
  children?: CommerceCategory[]
}