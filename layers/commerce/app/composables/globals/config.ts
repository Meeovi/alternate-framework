export interface CommerceConfig {
  productProvider: string
  cartProvider: string
  categoryProvider: string
}

let config: CommerceConfig = {
  productProvider: 'default',
  cartProvider: 'default',
  categoryProvider: 'default'
}

export function setCommerceConfig(newConfig: Partial<CommerceConfig>) {
  config = { ...config, ...newConfig }
}

export function getCommerceConfig() {
  return config
}
