import { getCommerceClient } from '../../utils/client'

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
  if (typeof dispatch === 'function') {
    try {
      dispatch({ type: 'PRODUCT_LIST_LOADED', payload: data })
    } catch (e) {
      // best-effort: ignore dispatch errors
    }
  }
  return data
}

const _default = { fetchProductList, handleData }
export default _default
