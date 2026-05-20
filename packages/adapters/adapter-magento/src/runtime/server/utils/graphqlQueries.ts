export const PRODUCTS_QUERY = `
  query Products($search: String, $pageSize: Int = 20, $currentPage: Int = 1) {
    products(search: $search, pageSize: $pageSize, currentPage: $currentPage) {
      items {
        id
        sku
        name
        type_id
        price_range {
          minimum_price {
            regular_price { value currency }
          }
        }
      }
      total_count
    }
  }
`

export interface ProductsQueryVariables {
  search?: string
  pageSize?: number
  page?: number
}

export function buildProductsVariables(input: ProductsQueryVariables) {
  return {
    search: input.search ?? '',
    pageSize: input.pageSize ?? 20,
    currentPage: input.page ?? 1,
  }
}
