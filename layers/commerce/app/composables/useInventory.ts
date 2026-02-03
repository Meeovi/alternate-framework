export function useInventory() {
  async function checkInventory(sku: string, qty: number) {
    try {
      const url = `${process.env.MAGENTO_API_URL}/inventory/${encodeURIComponent(sku)}`
      const res = await fetch(url)
      if (!res.ok) return false
      const data = await res.json()
      // Expecting an object { available: number }
      const available = (data?.available ?? data?.qty ?? 0) as number
      return available >= qty
    } catch (e) {
      // If inventory service is unavailable, fail-safe to false
      console.error('Inventory check failed', e)
      return false
    }
  }

  return { checkInventory }
}

export default useInventory
