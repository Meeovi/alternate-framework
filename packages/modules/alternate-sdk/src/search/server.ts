import useSearchAdapter from './adapter.js'

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