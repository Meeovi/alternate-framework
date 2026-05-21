import useFederationAdapter from './adapter.js'

type AnyRecord = Record<string, any>

export function getServerFederationAdapter(): AnyRecord {
	try {
		return useFederationAdapter()
	} catch {
		return {}
	}
}