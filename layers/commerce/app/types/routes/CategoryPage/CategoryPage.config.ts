export type CategorySortOptions = string;

export const SortDirections = {
  ASC: 'asc',
  DESC: 'desc',
} as const
export const NONE_SORT_OPTION_VALUE = 'none'

export const CategoryPageLayout = {
  GRID: 'grid',
  LIST: 'list',
} as const
export const CategoryDisplayMode = {
  PRODUCTS: 'products',
  CMS: 'cms',
  MIXED: 'mixed',
} as const

export default {
  SortDirections,
  CategoryPageLayout,
  CategoryDisplayMode,
  NONE_SORT_OPTION_VALUE,
}

export type SortDirections = typeof SortDirections[keyof typeof SortDirections]
export type CategoryDisplayMode = typeof CategoryDisplayMode[keyof typeof CategoryDisplayMode]
export type CategoryPageLayout = typeof CategoryPageLayout[keyof typeof CategoryPageLayout]
