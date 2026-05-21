import useCommerceAdapter from './adapter.js'

type AnyRecord = Record<string, any>

export function getServerCommerceAdapter(): AnyRecord {
	try {
		return useCommerceAdapter()
	} catch {
		return {}
	}
}