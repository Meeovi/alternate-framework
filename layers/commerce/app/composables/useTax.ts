import { getCommerceClient } from '../utils/client'

export function useTax() {
  const client = getCommerceClient()

  async function calculateTax(quoteId: string) {
    try {
      // Use adapter if available
      if (client && typeof client.calculateTax === 'function') {
        return await client.calculateTax(quoteId)
      }

      // Fallback to Magento tax calculation
      const url = `${process.env.COMMERCE_API_URL}${encodeURIComponent(quoteId)}`
      const res = await fetch(url)
      if (!res.ok) throw new Error('Tax calculation failed')
      return res.json()
    } catch (e) {
      console.error('Tax calculation error', e)
      throw e
    }
  }

  return { calculateTax }
}

export default useTax
