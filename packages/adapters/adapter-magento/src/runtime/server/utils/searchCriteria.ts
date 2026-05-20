export interface MagentoFilter {
  field: string
  value: string | number | boolean
  condition_type?: string
}

export interface MagentoSearchCriteria {
  filter_groups?: { filters: MagentoFilter[] }[]
  pageSize?: number
  currentPage?: number
  sortOrders?: { field: string; direction: 'ASC' | 'DESC' }[]
}

export function buildSearchCriteria(input: {
  filters?: MagentoFilter[]
  page?: number
  pageSize?: number
  sort?: { field: string; direction: 'ASC' | 'DESC' }[]
}): { searchCriteria: MagentoSearchCriteria } {
  const searchCriteria: MagentoSearchCriteria = {}

  if (input.filters?.length) {
    searchCriteria.filter_groups = [
      {
        filters: input.filters.map((f) => ({
          condition_type: 'eq',
          ...f,
        })),
      },
    ]
  }

  if (input.pageSize) searchCriteria.pageSize = input.pageSize
  if (input.page) searchCriteria.currentPage = input.page
  if (input.sort?.length) searchCriteria.sortOrders = input.sort

  return { searchCriteria }
}
