import type { NormalizedProduct } from './runtime/utils/normalizers/product'
import type { NormalizedCart } from './runtime/utils/normalizers/cart'
import type { NormalizedCustomer } from './runtime/utils/normalizers/customer'
import type {
  ShippingInformationPayload,
  PlaceOrderPayload,
  CreatePaymentIntentPayload
} from './runtime/types/checkout'

export interface MagentoClient {
  config: {
    url: string
    store?: string
    adminToken?: string
    customerTokenCookie?: string
    customerToken?: string
  }

  products: {
    list(params?: Record<string, any>): Promise<NormalizedProduct[]>
    getBySku(sku: string): Promise<NormalizedProduct>
  }

  cart: {
    get(cartId: string): Promise<NormalizedCart>
    getCustomerCart(token: string): Promise<NormalizedCart>
    createGuestCart(): Promise<string>
    addItem(cartId: string, item: any): Promise<NormalizedCart>
    removeItem(cartId: string, itemId: number): Promise<any>
  }

  customer: {
    me(token: string): Promise<NormalizedCustomer>
    login(email: string, password: string): Promise<string>
  }

  checkout: {
    setShippingInformation(payload: ShippingInformationPayload): Promise<any>
    placeOrder(payload: PlaceOrderPayload): Promise<any>
    createPaymentIntent(payload: CreatePaymentIntentPayload): Promise<any>
  }
}

declare module '#app' {
  interface NuxtApp {
    $magento: MagentoClient
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $magento: MagentoClient
  }
}

declare module 'nuxt/schema' {
  interface RuntimeConfig {
    magento: {
      url: string
      store?: string
      adminToken?: string
      customerTokenCookie?: string
      customerToken?: string
    }
  }

  interface PublicRuntimeConfig {
    magento: {
      url: string
      store?: string
    }
  }
}

export {}
