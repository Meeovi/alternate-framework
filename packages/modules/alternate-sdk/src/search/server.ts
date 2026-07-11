import useSearchAdapter from './adapter.js'
import { SearchAdapterRegistry } from '../contracts/search.js'

type AnyRecord = Record<string, any>

export function getServerSearchAdapter(): AnyRecord {
	try {
		return useSearchAdapter()
	} catch {
		return {}
	}
}

export function getSearchServer(event?: any): AnyRecord {
	return getServerSearchAdapter()
}

export function useSearch(): AnyRecord {
	const adapter = useSearchAdapter()

	return {
		search: (query: string, options?: AnyRecord) => adapter?.search?.(query, options),
		suggest: (query: string) => adapter?.suggest?.(query),
		index: (doc: AnyRecord) => adapter?.index?.(doc),
		stats: () => adapter?.stats?.(),
		clear: () => adapter?.clear?.(),
		getAdapter: () => adapter,
	}
}