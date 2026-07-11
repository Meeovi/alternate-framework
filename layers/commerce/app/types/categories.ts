// layers/commerce/app/types/categories.ts
import type { ID, Maybe, Money, MediaAsset, SeoMetadata, Timestamps } from './common'

export type CategoryDisplayMode = 'products' | 'cms_page' | 'both'

export interface Category {
  id: ID
  name: string
  slug: string
  description?: string
  content?: string
  parentId: Maybe<ID>
  path?: string // materialized path, e.g. "1/4/12"
  level?: number
  position?: number
  isActive?: boolean
  includeInMenu?: boolean
  displayMode?: CategoryDisplayMode
  image?: Maybe<string | MediaAsset>
  color?: string
  children?: Category[]
  productIds?: ID[]
  seo?: SeoMetadata
  metaTitle?: string
}

export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[]
}

export interface CategorySearchParams {
  parentId?: Maybe<ID>
  storeId?: ID
  includeInactive?: boolean
  depth?: number
  search?: string
}

export interface UseCategoriesState {
  data: Maybe<Category[]>
  loading: boolean
}

export interface CategoryProvider {
  getCategories(params?: CategorySearchParams): Promise<Category[]>
  getCategoryBySlug(slug: string): Promise<Maybe<Category>>
  getCategoryById(id: ID): Promise<Maybe<Category>>
  getCategoryTree(rootId?: Maybe<ID>): Promise<CategoryTreeNode[]>
}
