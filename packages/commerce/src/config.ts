export interface CommerceConfig {
  productProvider: string
  cartProvider: string
  categoryProvider: string
}

let config: CommerceConfig = {
  productProvider: 'directus',
  cartProvider: 'directus',
  categoryProvider: 'directus'
}

export function setCommerceConfig(newConfig: Partial<CommerceConfig>) {
  config = { ...config, ...newConfig }
}

export function getCommerceConfig() {
  return config
}
