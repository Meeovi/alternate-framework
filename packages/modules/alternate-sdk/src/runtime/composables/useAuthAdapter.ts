type AnyRecord = Record<string, any>

function resolveGatewayAuth(): AnyRecord {
	const runtime = globalThis as AnyRecord
	const gatewayFactory = runtime.useGateway

	if (typeof gatewayFactory !== 'function') {
		return {}
	}

	try {
		const gateway = gatewayFactory() as AnyRecord
		return (gateway?.auth as AnyRecord) || {}
	} catch {
		return {}
	}
}

function resolveRuntimeAuth(): AnyRecord {
	const runtime = globalThis as AnyRecord
	const authFactory = runtime.useAuth

	if (typeof authFactory !== 'function') {
		return {}
	}

	try {
		return (authFactory() as AnyRecord) || {}
	} catch {
		return {}
	}
}

export default function useAuthAdapter(): AnyRecord {
	const gatewayAuth = resolveGatewayAuth()
	const runtimeAuth = resolveRuntimeAuth()

	const callAuth = async (methodNames: string[], ...args: any[]) => {
		for (const methodName of methodNames) {
			const fromRuntime = runtimeAuth?.[methodName]
			if (typeof fromRuntime === 'function') return fromRuntime(...args)

			const fromGateway = gatewayAuth?.[methodName]
			if (typeof fromGateway === 'function') return fromGateway(...args)
		}
		return null
	}

	const fetchSession = async (...args: any[]) => callAuth(['fetchSession', 'getSession', 'session'], ...args)
	const getSession = async (...args: any[]) => callAuth(['getSession', 'fetchSession', 'session'], ...args)
	const signIn = async (...args: any[]) => callAuth(['signIn', 'login'], ...args)
	const signOut = async (...args: any[]) => callAuth(['signOut', 'logout'], ...args)
	const signUp = async (...args: any[]) => callAuth(['signUp', 'register'], ...args)
	const refresh = async (...args: any[]) => callAuth(['refresh', 'refreshSession'], ...args)
	const requestPasswordReset = async (...args: any[]) => callAuth(['requestPasswordReset', 'forgotPassword'], ...args)
	const confirmPasswordReset = async (...args: any[]) => callAuth(['confirmPasswordReset', 'resetPassword'], ...args)

	return {
		...gatewayAuth,
		...runtimeAuth,
		fetchSession,
		getSession,
		signIn,
		signOut,
		signUp,
		refresh,
		requestPasswordReset,
		confirmPasswordReset,
	}
}
