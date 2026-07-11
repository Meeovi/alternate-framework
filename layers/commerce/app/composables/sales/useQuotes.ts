import { getCommerceClient } from '../../utils/client'
import type { CommerceClient } from '../../utils/client'

export function useQuotes() {
  const client = getCommerceClient() as CommerceClient

  async function listQuotes(opts: Record<string, unknown> = {}) {
    return client.listQuotes(opts)
  }

  async function getQuoteById(id: string) {
    return client.getQuote(id)
  }

  async function createQuote(payload: Record<string, unknown>) {
    return client.createQuote(payload)
  }

  async function acceptQuote(id: string) {
    return client.acceptQuote(id)
  }

  return {
    listQuotes,
    getQuoteById,
    createQuote,
    acceptQuote,
  }
}

export default useQuotes
