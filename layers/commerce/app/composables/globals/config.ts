export interface CommerceConfig {
  productProvider: string
  cartProvider: string
  categoryProvider: string
  storeProvider: string
  checkoutProvider: string
  paymentProvider: string
  shippingProvider: string
  taxProvider: string
  inventoryProvider: string
}

let config: CommerceConfig = {
  productProvider: 'default',
  cartProvider: 'default',
  categoryProvider: 'default',
  storeProvider: 'default',
  checkoutProvider: 'default',
  paymentProvider: 'default',
  shippingProvider: 'default',
  taxProvider: 'default',
  inventoryProvider: 'default',
}

export function setCommerceConfig(newConfig: Partial<CommerceConfig>) {
  config = { ...config, ...newConfig }
}

export function getCommerceConfig(): CommerceConfig {
  return config
}
