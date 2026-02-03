export function useTax() {
  async function calculateTax(quoteId: string) {
    try {
      const url = `${process.env.MAGENTO_API_URL}/tax/calculate?quoteId=${encodeURIComponent(quoteId)}`
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
