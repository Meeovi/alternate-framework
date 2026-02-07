import { getCommerceClient } from '../../utils/client'
import { useProductStore } from '../product'

// Product dispatcher that uses the normalized commerce client when available.
export async function fetchProductById(id: string): Promise<any | null> {
  try {
    const client = getCommerceClient()
    if (client) {
      if (typeof client.getProductById === 'function') return await client.getProductById(id)
      if (typeof client.getProduct === 'function') return await client.getProduct(id)
      if (typeof client.getProducts === 'function') {
        const list = await client.getProducts({ ids: [id] })
        return Array.isArray(list) ? list.find((p: any) => p.id === id || p.sku === id) ?? null : null
      }
    }
  } catch (e) {
    console.error('fetchProductById failed:', e)
  }
  return null
}

export async function fetchProductVariants(productId: string): Promise<any[]> {
  try {
    const client = getCommerceClient()
    if (client && typeof client.getProductVariants === 'function') {
      return await client.getProductVariants(productId)
    }
  } catch (e) {
    console.error('fetchProductVariants failed:', e)
  }
  return []
}

export async function handleData(dispatch: any, options: any) {
  // If a preload system passes a dispatch function and product id, load product and dispatch
  try {
    if (typeof dispatch === 'function' && options && options.id) {
      const product = await fetchProductById(options.id)
      // Update Pinia store when available
      try {
        const store = useProductStore()
        if (store && typeof store.selectProduct === 'function') {
          store.selectProduct(product)
        } else if (store) {
          ;(store as any).selectedProduct = product
        }
      } catch (e) {
        // ignore Pinia errors
      }

      return product
    }
  } catch (e) {
    // ignore
  }
  return null
}

const _default = {
  fetchProductById,
  fetchProductVariants,
  handleData,
}

export default _default
