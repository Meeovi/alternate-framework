import useCommerceAdapter from './adapter.js'

type AnyRecord = Record<string, any>

export function getServerCommerceAdapter(): AnyRecord {
	try {
		return useCommerceAdapter()
	} catch {
		return {}
	}
}

export function getCommerceServer(event?: any): AnyRecord {
	return getServerCommerceAdapter()
}