/**
 * GET /api/commerce/products
 *
 * Fetch products from Magento through the mesh gateway.
 *
 * Query Parameters:
 *   - pageSize: number (default: 20)
 *   - currentPage: number (default: 1)
 *   - search: string (optional, filters by name/description)
 *
 * @example
 * GET /api/commerce/products?pageSize=10&currentPage=1
 *
 * Response:
 * {
 *   items: [{ id, name, sku, price, image, stock_status, ... }],
 *   pageInfo: { page_size, current_page, total_pages },
 *   totalCount: number
 * }
 */

import type { ProductInterface, Products } from '../../adapters/magento/generated/types'
import { defineEventHandler, getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const pageSize = Math.min(Math.max(parseInt(query.pageSize as string) || 20, 1), 100) // Limit to 100
  const currentPage = Math.max(parseInt(query.currentPage as string) || 1, 1)
  const search = query.search as string | undefined

  try {
    // Import mesh client
    const { executeQuery } = await import('../../mesh')

    // Build GraphQL query
    const graphqlQuery = `
      query GetProducts($pageSize: Int = 20, $currentPage: Int = 1${search ? ', $search: String' : ''}) {
        products(
          pageSize: $pageSize
          currentPage: $currentPage
          ${search ? 'filter: { name: { match: $search } }' : ''}
        ) {
          items {
            id
            sku
            name
            type_id
            description {
              html
            }
            short_description {
              html
            }
            price_range {
              minimum_price {
                regular_price {
                  value
                  currency
                }
                final_price {
                  value
                  currency
                }
                discount {
                  percent_off
                }
              }
            }
            image {
              url
              label
            }
            stock_status
            review_count
            rating_summary
          }
          page_info {
            page_size
            current_page
            total_pages
          }
          total_count
        }
      }
    `

    const variables: Record<string, any> = {
      pageSize,
      currentPage,
    }

    if (search) {
      variables.search = search
    }

    const result = await executeQuery<{ products: Products }>(graphqlQuery, { variables })

    return {
      items: result.products.items.map((item: ProductInterface) => ({
        id: item.id,
        sku: item.sku,
        name: item.name,
        typeId: item.type_id,
        description: item.description?.html,
        shortDescription: item.short_description?.html,
        price: item.price_range.minimum_price.final_price,
        regularPrice: item.price_range.minimum_price.regular_price,
        discount: item.price_range.minimum_price.discount,
        image: item.image,
        stockStatus: item.stock_status,
        reviewCount: item.review_count,
        ratingSummary: item.rating_summary,
      })),
      pageInfo: result.products.page_info,
      totalCount: result.products.total_count,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[/api/commerce/products] Error:', message)

    setResponseStatus(event, 500)
    return {
      error: 'Failed to fetch products',
      message,
    }
  }
})
