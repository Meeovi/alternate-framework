type AnyRecord = Record<string, any>

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
