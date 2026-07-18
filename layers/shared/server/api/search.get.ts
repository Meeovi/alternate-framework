// server/api/search.get.ts
import { createDirectus, rest, readItems } from '@directus/sdk'
import { getQuery, defineEventHandler } from 'h3'
import { $fetch } from 'ofetch'

// Initialise Directus client once outside the handler
const directus = createDirectus(process.env.DIRECTUS_URL || 'https://your-directus-backend.com').with(rest())

export default defineEventHandler(async (event) => {
  const queryParams = getQuery(event)
  
  // Extract global parameters
  const searchTerm = String(queryParams.q || '')
  const page = Math.max(1, Number(queryParams.page || 1))
  const pageSize = Math.max(1, Number(queryParams.limit || 12))
  const sortBy = String(queryParams.sort || 'relevance')

  // --- 1. DYNAMIC MAGENTO BUILDER ---
  const magentoVariables: Record<string, any> = {
    search: searchTerm,
    currentPage: page,
    pageSize: pageSize
  }

  // Handle Dynamic Sorting for Magento
  if (sortBy !== 'relevance') {
    const [field, direction] = sortBy.split('_') as any // e.g., "price_ASC" -> { price: 'ASC' }
    magentoVariables.sort = { [field]: direction.toUpperCase() }
  }

  // Map incoming URL arrays directly to Magento input filters
  const productFilters: Record<string, any> = {}
  
  // Dynamic array processor for facets like brands or manufacturer
  const facetKeys = ['brands', 'manufacturer', 'category_id']
  facetKeys.forEach((key) => {
    if (queryParams[key]) {
      // Handles both single string values and arrays (?brands=Nike&brands=Adidas)
      const values = Array.isArray(queryParams[key]) 
        ? queryParams[key].map(String) 
        : [String(queryParams[key])]
      
      productFilters[key] = { in: values }
    }
  })

  if (Object.keys(productFilters).length > 0) {
    magentoVariables.filters = productFilters
  }

  // --- 2. CONDITIONAL DIRECTUS BUILDER ---
  // If the user uses product-specific filters, skip querying articles completely
  const hasProductFilters = queryParams.brands || queryParams.manufacturer
  const shouldSearchArticles = searchTerm && !hasProductFilters

  // --- 3. EXECUTE CONCURRENT REQUESTS ---
  const promises: [Promise<any>, Promise<any> | null] = [
    // Magento Request
    $fetch(`${process.env.MAGENTO_URL || 'https://your-magento-backend.com'}`, {
      method: 'POST',
      body: {
        query: `
          query AdvancedSearch($search: String!, $filters: ProductAttributeFilterInput, $pageSize: Int, $currentPage: Int, $sort: ProductAttributeSortInput) {
            products(search: $search, filter: $filters, pageSize: $pageSize, currentPage: $currentPage, sort: $sort) {
              total_count
              page_info { current_page page_size total_pages }
              items {
                id name sku price_range { minimum_price { final_price { value currency } } }
                image { url }
              }
            }
          }
        `,
        variables: magentoVariables
      }
    }),
    // Directus Request (or skipped)
    shouldSearchArticles
      ? directus.request(
          readItems('articles', {
            search: searchTerm,
            limit: pageSize,
            page: page,
            fields: ['id', 'name', 'slug', 'excerpt'],
            sort: ['-id']
          })
        )
      : Promise.resolve(null)
  ]

  const [magentoResponse, directusResponse] = await Promise.all(promises)

  return {
    meta: {
      currentPage: page,
      pageSize: pageSize,
      magentoTotalPages: magentoResponse?.data?.products?.page_info?.total_pages || 0,
      magentoTotalCount: magentoResponse?.data?.products?.total_count || 0
    },
    products: magentoResponse?.data?.products?.items || [],
    articles: directusResponse || [] // Will be empty array if skipped
  }
})
