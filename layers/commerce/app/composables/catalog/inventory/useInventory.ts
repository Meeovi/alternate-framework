import { getCommerceClient } from '../../utils/client'

export function useInventory() {
  const client = getCommerceClient()

  async function checkInventory(sku: string, qty: number) {
    try {
      // Prefer adapter-provided inventory check when available
      if (client && typeof client.checkInventory === 'function') {
        return await client.checkInventory(sku, qty)
      }

      // Fallback to Commerce inventory endpoint
      const url = `${process.env.COMMERCE_API_URL}${encodeURIComponent(sku)}`
      const res = await fetch(url)
      if (!res.ok) return false
      const data = await res.json()
      const available = (data?.available ?? data?.qty ?? 0) as number
      return available >= qty
    } catch (e) {
      console.error('Inventory check failed', e)
      return false
    }
  }

  return { checkInventory }
}

export default useInventory
