type AnyRecord = Record<string, any>
import { SearchAdapterRegistry } from '../contracts/search.js'
import type { SearchAdapter as SearchAdapterType } from '../contracts/search.js'

function resolveGatewaySearch(): AnyRecord {
	const runtime = globalThis as AnyRecord
	const gatewayFactory = runtime.useGateway

	if (typeof gatewayFactory !== 'function') {
		return {}
	}

	try {
		const gateway = gatewayFactory() as AnyRecord
		return (gateway?.search as AnyRecord) || {}
	} catch {
		return {}
	}
}

export default function useSearchAdapter(): AnyRecord {
	const registryAdapter = SearchAdapterRegistry.getDefaultAdapter() as SearchAdapterType | undefined
	
	if (registryAdapter) {
		return registryAdapter
	}

	const search = resolveGatewaySearch()

	const searchItems = async (...args: any[]) => {
		const fn = search?.searchItems ?? search?.search
		if (typeof fn === 'function') return fn(...args)
		return []
	}

	const suggest = async (...args: any[]) => {
		const fn = search?.suggest ?? search?.autocomplete
		if (typeof fn === 'function') return fn(...args)
		return []
	}

	return {
		...search,
		searchItems,
		suggest,
	}
}

export { useSearchAdapter }

export type { SearchAdapter, SearchContract, ProxyContract } from '../contracts/search.js'
