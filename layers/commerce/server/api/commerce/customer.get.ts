/**
 * GET /api/commerce/customer
 *
 * Fetch current customer data and orders from Magento through the mesh gateway.
 *
 * Requires: Valid authentication header (Bearer token)
 *
 * @example
 * GET /api/commerce/customer
 * Authorization: Bearer {customer_token}
 *
 * Response:
 * {
 *   id: string,
 *   firstname: string,
 *   lastname: string,
 *   email: string,
 *   is_subscribed: boolean,
 *   addresses: [...],
 *   orders: [...]
 * }
 */

import { defineEventHandler, getHeader, setResponseStatus } from 'h3'
import type { Customer } from '../../adapters/magento/generated/types'

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization')

  if (!authHeader) {
    setResponseStatus(event, 401)
    return {
      error: 'Unauthorized',
      message: 'Authorization header required',
    }
  }

  try {
    const { executeQuery } = await import('../../mesh')

    const graphqlQuery = `
      query GetCustomer {
        customer {
          id
          firstname
          lastname
          email
          is_subscribed
          addresses {
            id
            firstname
            lastname
            street
            city
            region { region_code region }
            postcode
            country_code
            telephone
            default_shipping
            default_billing
          }
          orders(pageSize: 20) {
            total_count
            items {
              id
              order_number
              status
              created_at
              grand_total { value currency }
              items {
                id
                product_name
                product_sku
                quantity_ordered
                product_sale_price { value currency }
              }
              shipping_address {
                firstname
                lastname
                street
                city
              }
              billing_address {
                firstname
                lastname
                street
                city
              }
            }
          }
        }
      }
    `

    const result = await executeQuery<{ customer: Customer }>(graphqlQuery)

    return result.customer
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[/api/commerce/customer] Error:', message)

    if (message.includes('401') || message.includes('Unauthorized') || message.includes('invalid')) {
      setResponseStatus(event, 401)
      return {
        error: 'Unauthorized',
        message: 'Invalid or expired authentication token',
      }
    }

    setResponseStatus(event, 500)
    return {
      error: 'Failed to fetch customer data',
      message,
    }
  }
})
