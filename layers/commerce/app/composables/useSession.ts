import { createAuthAdapter } from 'alternate-sdk/auth/adapter'

import { useAppGateway } from './useAppGateway'

type SessionState = {
	data: any
	loading: boolean
	error: any
}

export function useSession() {
	const state = useState<SessionState>('commerce:session', () => ({
		data: null,
		loading: false,
		error: null,
	}))
	const runtimeUseAuth = (globalThis as any).useAuth as (() => any) | undefined
	const runtimeAuth = runtimeUseAuth?.() || {}
	const auth = createAuthAdapter(runtimeAuth, useAppGateway().auth || {}) as any

	const fetchSession = async (...args: any[]) => {
		state.value.loading = true
		state.value.error = null
		try {
			const session = await (auth.fetchSession?.(...args) ?? auth.getSession?.(...args) ?? null)
			state.value.data = session
			return session
		} catch (error) {
			state.value.error = error
			throw error
		} finally {
			state.value.loading = false
		}
	}

	return {
		...state.value,
		fetchSession,
	}
}
