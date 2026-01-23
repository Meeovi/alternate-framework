import { magentoGraphQL } from './utils/graphql'
import { magentoRest } from './utils/rest'
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
        // Try GraphQL first
        const q = `query Products($search: String) {
  products(search: $search) {
    items {
      id
      sku
      name
      type_id
      price_range {
        minimum_price { regular_price { value } }
      }
      media_gallery_entries { file }
      custom_attributes { attribute_code value }
    }
  }
}`
        const vars = { search: params?.search || null }
        const data = await magentoGraphQL(config, q, vars)
        const items = data?.products?.items || []
        return items.map((it: any) => {
          // normalize shape to previous REST mapper
          const shape = {
            id: it.id,
            sku: it.sku,
            name: it.name,
            type_id: it.type_id,
            price: it.price_range?.minimum_price?.regular_price?.value,
            media_gallery_entries: it.media_gallery_entries,
            custom_attributes: it.custom_attributes
          }
          return productNormalizer.normalizeProduct(shape)
        })
      },

      async getBySku(sku: string) {
        const q = `query ProductBySku($sku: String!) { products(search: $sku) { items { id sku name type_id price_range { minimum_price { regular_price { value } } } media_gallery_entries { file } custom_attributes { attribute_code value } } } }`
        const data = await magentoGraphQL(config, q, { sku })
        const it = data?.products?.items?.[0]
        if (!it) return null
        const shape = {
          id: it.id,
          sku: it.sku,
          name: it.name,
          type_id: it.type_id,
          price: it.price_range?.minimum_price?.regular_price?.value,
          media_gallery_entries: it.media_gallery_entries,
          custom_attributes: it.custom_attributes
        }
        return productNormalizer.normalizeProduct(shape)
      }
    },

    customer: {
      async me(token: string) {
        const q = `query { customer { id email firstname lastname } }`
        const data = await magentoGraphQL({ ...config, customerToken: token }, q)
        const c = data?.customer
        return customerNormalizer.normalizeCustomer(c)
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
        const q = `query Cart($cartId: String!) { cart(cart_id: $cartId) { items { id product { sku name } quantity prices { price { value } } } } }`
        const data = await magentoGraphQL(config, q, { cartId })
        const items = data?.cart?.items || []
        const shape = {
          id: cartId,
          items: items.map((i: any) => ({
            item_id: i.id,
            sku: i.product?.sku,
            qty: i.quantity,
            name: i.product?.name,
            price: i.prices?.price?.value ?? i.prices?.price?.value
          }))
        }
        return cartNormalizer.normalizeCart(shape)
      },

      async getCustomerCart(token: string) {
        const q = `query { customerCart { items { id product { sku name } quantity prices { price { value } } } } }`
        const data = await magentoGraphQL({ ...config, customerToken: token }, q)
        const items = data?.customerCart?.items || []
        const shape = {
          id: 'customer',
          items: items.map((i: any) => ({
            item_id: i.id,
            sku: i.product?.sku,
            qty: i.quantity,
            name: i.product?.name,
            price: i.prices?.price?.value
          }))
        }
        return cartNormalizer.normalizeCart(shape)
      },

      async createGuestCart() {
        const m = `mutation { createEmptyCart }`
        const data = await magentoGraphQL(config, m)
        return data?.createEmptyCart
      },

      async addItem(cartId: string, item: any) {
        const m = `mutation AddItem($cartId: String!, $sku: String!, $qty: Float!) { addSimpleProductsToCart(input:{cart_id:$cartId, cart_items:[{data:{sku:$sku, qty:$qty}}]}) { cart { items { id product { sku name } quantity prices { price { value } } } } } }`
        const data = await magentoGraphQL(config, m, { cartId, sku: item.sku, qty: item.qty || item.qty_to_add || 1 })
        const items = data?.addSimpleProductsToCart?.cart?.items || []
        const shape = {
          id: cartId,
          items: items.map((i: any) => ({
            item_id: i.id,
            sku: i.product?.sku,
            qty: i.quantity,
            name: i.product?.name,
            price: i.prices?.price?.value
          }))
        }
        return cartNormalizer.normalizeCart(shape)
      },

      async removeItem(cartId: string, itemId: number) {
        const m = `mutation RemoveItem($cartId: String!, $itemId: Float!) { removeItemFromCart(input:{cart_id:$cartId, cart_item_id:$itemId}) { cart { items { id product { sku name } quantity prices { price { value } } } } } }`
        const data = await magentoGraphQL(config, m, { cartId, itemId })
        const items = data?.removeItemFromCart?.cart?.items || []
        const shape = {
          id: cartId,
          items: items.map((i: any) => ({
            item_id: i.id,
            sku: i.product?.sku,
            qty: i.quantity,
            name: i.product?.name,
            price: i.prices?.price?.value
          }))
        }
        return cartNormalizer.normalizeCart(shape)
      }
    },

    checkout: {
      async setShippingInformation(payload: ShippingInformationPayload) {
        const { cartId, address, shipping_method } = payload as any
        const m = `mutation SetShipping($cartId: String!, $address: ShippingAddressInput!) { setShippingAddressesOnCart(input:{cart_id:$cartId, shipping_addresses:[$address]}) { cart { items { id product { sku name } quantity prices { price { value } } } } } }`
        const data = await magentoGraphQL(config, m, { cartId, address })
        return data
      },

      async placeOrder(payload: PlaceOrderPayload) {
        const { cartId } = payload as any
        const m = `mutation PlaceOrder($cartId: String!) { placeOrder(input:{cart_id:$cartId}) }`
        const data = await magentoGraphQL(config, m, { cartId })
        return data?.placeOrder
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
