/**
 * GET /api/commerce/cart
 *
 * Fetch cart data from Magento through the mesh gateway.
 *
 * Query Parameters:
 *   - cartId: string (required)
 *
 * @example
 * GET /api/commerce/cart?cartId=abc123
 *
 * Response:
 * {
 *   id: string,
 *   email: string,
 *   items: [...],
 *   prices: { ... },
 *   shippingAddresses: [...],
 *   billingAddress: { ... }
 * }
 */

import { defineEventHandler, getQuery, setResponseStatus } from 'h3'
import type { Cart } from '../../adapters/magento/generated/types'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const cartId = query.cartId as string

  if (!cartId) {
    setResponseStatus(event, 400)
    return {
      error: 'Missing cartId parameter',
    }
  }

  try {
    const { executeQuery } = await import('../../mesh')

    const graphqlQuery = `
      query GetCart($cartId: String!) {
        cart(cart_id: $cartId) {
          id
          email
          items {
            id
            product {
              id
              sku
              name
              image { url label }
            }
            quantity
            prices {
              price { value currency }
              row_total { value currency }
              row_total_including_tax { value currency }
              discounts {
                amount { value currency }
                label
              }
            }
          }
          prices {
            subtotal_including_tax { value currency }
            grand_total { value currency }
            discounts { amount { value currency } label }
            applied_taxes { amount { value currency } label }
          }
          shipping_addresses {
            firstname
            lastname
            street
            city
            region { code label }
            postcode
            country { code label }
            telephone
            selected_shipping_method {
              carrier_code
              method_code
              carrier_title
              method_title
              amount { value currency }
            }
          }
          billing_address {
            firstname
            lastname
            street
            city
            region { code }
            postcode
            country { code }
            telephone
          }
        }
      }
    `

    const result = await executeQuery<{ cart: Cart }>(graphqlQuery, {
      variables: { cartId },
    })

    return result.cart
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[/api/commerce/cart] Error:', message)

    setResponseStatus(event, 500)
    return {
      error: 'Failed to fetch cart',
      message,
    }
  }
})
