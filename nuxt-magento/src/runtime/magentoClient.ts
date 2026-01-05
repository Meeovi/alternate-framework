import {
  magentoRest
} from './utils/rest'
import * as productNormalizer from './utils/normalizers/product'
import * as cartNormalizer from './utils/normalizers/cart'
import * as customerNormalizer from './utils/normalizers/customer'
import type {
  ShippingInformationPayload,
  PlaceOrderPayload,
  CreatePaymentIntentPayload
} from './types/checkout'

export interface MagentoRuntimeConfig {
  customerToken: any
  url: string
  store ? : string
  adminToken ? : string
  customerTokenCookie ? : string
}

export function createMagentoClient(config: MagentoRuntimeConfig) {
  return {
    config,

    products: {
      async list(params ? : Record < string, any > ) {
        const res = await magentoRest(config, '/V1/products', {
          params
        })
        return (res.items || []).map(productNormalizer.normalizeProduct)
      },

      async getBySku(sku: string) {
        const res = await magentoRest(config, `/V1/products/${encodeURIComponent(sku)}`)
        return productNormalizer.normalizeProduct(res)
      }
    },

    customer: {
      async me(token: string) {
        const res = await magentoRest({
            ...config,
            customerToken: token
          },
          '/V1/customers/me'
        )
        return customerNormalizer.normalizeCustomer(res)
      },

      async login(username: string, password: string) {
        const res = await magentoRest(
          config,
          '/V1/integration/customer/token', {
            method: 'POST',
            body: {
              username,
              password
            }
          }
        )
        return res as string // token
      }
    },

    cart: {
      async get(cartId: string) {
        const res = await magentoRest(config, `/V1/guest-carts/${cartId}`)
        return cartNormalizer.normalizeCart(res)
      },

      async getCustomerCart(token: string) {
        const res = await magentoRest({
            ...config,
            customerToken: token
          },
          `/V1/carts/mine`
        )
        return cartNormalizer.normalizeCart(res)
      },

      async createGuestCart() {
        return await magentoRest(config, '/V1/guest-carts', {
          method: 'POST'
        })
      },

      async addItem(cartId: string, item: any) {
        const res = await magentoRest(
          config,
          `/V1/guest-carts/${cartId}/items`, {
            method: 'POST',
            body: {
              cartItem: item
            }
          }
        )
        return cartNormalizer.normalizeCart(res)
      },

      async removeItem(cartId: string, itemId: number) {
        return await magentoRest(
          config,
          `/V1/guest-carts/${cartId}/items/${itemId}`, {
            method: 'DELETE'
          }
        )
      }
    },

    checkout: {
      async setShippingInformation(payload: ShippingInformationPayload) {
        const {
          cartId,
          ...rest
        } = payload

        return await magentoRest(
          config,
          `/V1/guest-carts/${cartId}/shipping-information`, {
            method: 'POST',
            body: rest
          }
        )
      },

      async placeOrder(payload: PlaceOrderPayload) {
        const {
          cartId,
          paymentMethod,
          billingAddress
        } = payload

        return await magentoRest(
          config,
          `/V1/guest-carts/${cartId}/payment-information`, {
            method: 'POST',
            body: {
              paymentMethod,
              billing_address: billingAddress
            }
          }
        )
      },

      async createPaymentIntent(payload: CreatePaymentIntentPayload) {
        const {
          provider,
          cartId,
          amount
        } = payload

        if (provider === 'stripe') {
          return await $fetch('/api/stripe/create-intent', {
            method: 'POST',
            body: {
              amount,
              cartId
            }
          })
        }

        throw new Error(`Unknown payment provider: ${provider}`)
      }
    }
  }
}
