import { getCommerceClient } from '../../utils/client'
import { useProductListStore } from '../productList'

// ProductList dispatcher that prefers the normalized commerce client when
// available. Returns an array of normalized products or an empty array.
export async function fetchProductList(params: any = {}): Promise<any[]> {
  const client = getCommerceClient()
  try {
    if (client) {
      if (typeof client.listProducts === 'function') {
        return await client.listProducts(params)
      }
      if (typeof client.getProducts === 'function') {
        return await client.getProducts(params)
      }
    }
  } catch (e) {
    console.error('fetchProductList failed:', e)
  }
  return []
}

export async function handleData(dispatch: any, options: any) {
  const data = await fetchProductList(options)
  // Update Pinia store when available
  try {
    const store = useProductListStore()
    if (store && typeof store.fetch === 'function') {
      // let the store perform its fetch to populate items/state consistently
      await store.fetch(options)
    } else if (store) {
      ;(store as any).items = Array.isArray(data) ? data : []
    }
  } catch (e) {
    // ignore Pinia errors
  }

  return data
}

const _default = { fetchProductList, handleData }
export default _default
