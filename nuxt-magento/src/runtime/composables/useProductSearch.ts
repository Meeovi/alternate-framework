import { useNuxtApp } from "#imports"

export const useMagentoProducts = () => {

  return {
    list: (query?: any) =>
      $fetch('/api/magento/products', { query }),
    getBySku: (sku: string) =>
      $fetch(`/api/magento/product-${encodeURIComponent(sku)}`)
  }
}
