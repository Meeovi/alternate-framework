type AnyRecord = Record<string, any>

function resolveGatewayFederation(): AnyRecord {
	const runtime = globalThis as AnyRecord
	const gatewayFactory = runtime.useGateway

	if (typeof gatewayFactory !== 'function') {
		return {}
	}

	try {
		const gateway = gatewayFactory() as AnyRecord
		return (gateway?.federation as AnyRecord) || {}
	} catch {
		return {}
	}
}

export default function useFederationAdapter(): AnyRecord {
	const federation = resolveGatewayFederation()

	const discover = async (...args: any[]) => {
		const fn = federation?.discover
		if (typeof fn === 'function') return fn(...args)
		return []
	}

	const resolveActor = async (...args: any[]) => {
		const fn = federation?.resolveActor
		if (typeof fn === 'function') return fn(...args)
		return null
	}

	return {
		...federation,
		discover,
		resolveActor,
	}
}
