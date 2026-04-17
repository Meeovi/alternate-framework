import { getCommerceClient } from '../../utils/client'

function clientOrNull() {
	try {
		return getCommerceClient() as any
	} catch {
		return null
	}
}

function normalizeSlug(value: string) {
	return String(value || '')
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)/g, '')
}

export function useGlossary() {
	const client = clientOrNull()

	async function listTerms(opts: Record<string, unknown> = {}) {
		if (client && typeof client.listGlossaryTerms === 'function') return client.listGlossaryTerms(opts)
		return []
	}

	async function getTermBySlug(slug: string) {
		if (client && typeof client.getGlossaryTermBySlug === 'function') return client.getGlossaryTermBySlug(slug)
		const target = normalizeSlug(slug)
		const terms = await listTerms()
		return Array.isArray(terms)
			? terms.find((term: any) => normalizeSlug(term?.slug || term?.name || term?.title || '') === target) || null
			: null
	}

	async function searchTerms(query: string) {
		const list = await listTerms()
		const token = String(query || '').trim().toLowerCase()
		if (!token) return Array.isArray(list) ? list : []
		return Array.isArray(list)
			? list.filter((term: any) => {
				const haystack = `${term?.name || ''} ${term?.title || ''} ${term?.description || ''}`.toLowerCase()
				return haystack.includes(token)
			})
			: []
	}

	return {
		listTerms,
		getTermBySlug,
		searchTerms,
	}
}

export default useGlossary
