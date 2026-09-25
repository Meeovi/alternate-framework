import useContentAdapter from './adapter.js'

type AnyRecord = Record<string, any>

export function getServerContentAdapter(): AnyRecord {
	try {
		return useContentAdapter()
	} catch {
		return {}
	}
}

export function getContentServer(event?: any): AnyRecord {
	return getServerContentAdapter()
}