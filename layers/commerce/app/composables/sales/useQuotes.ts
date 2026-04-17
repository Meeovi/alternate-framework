import { getCommerceClient } from '../../utils/client'

function clientOrNull() {
	try {
		return getCommerceClient() as any
	} catch {
		return null
	}
}

export function useQuotes() {
	const client = clientOrNull()

	async function listQuotes(opts: Record<string, unknown> = {}) {
		if (client && typeof client.listQuotes === 'function') return client.listQuotes(opts)
		return []
	}

	async function getQuoteById(id: string) {
		if (client && typeof client.getQuote === 'function') return client.getQuote(id)
		const quotes = await listQuotes()
		return Array.isArray(quotes) ? quotes.find((quote: any) => quote?.id === id) || null : null
	}

	async function createQuote(payload: Record<string, unknown>) {
		if (client && typeof client.createQuote === 'function') return client.createQuote(payload)
		return null
	}

	async function acceptQuote(id: string) {
		if (client && typeof client.acceptQuote === 'function') return client.acceptQuote(id)
		return { success: false, reason: 'acceptQuote not implemented by provider' }
	}

	return {
		listQuotes,
		getQuoteById,
		createQuote,
		acceptQuote,
	}
}

export default useQuotes
