import { createAuthAdapter } from 'alternate-sdk/auth/adapter'

import { useAppGateway } from './useAppGateway'

export function useUser() {
	const state = useState<any>('commerce:user', () => null)
	const runtimeUseAuth = (globalThis as any).useAuth as (() => any) | undefined
	const runtimeAuth = runtimeUseAuth?.() || {}
	const auth = createAuthAdapter(runtimeAuth, useAppGateway().auth || {}) as any

	const fetchUser = async (...args: any[]) => {
		const session = await (auth.fetchSession?.(...args) ?? auth.getSession?.(...args) ?? null)
		const user = session?.user ?? runtimeAuth.user ?? null
		state.value = user
		return user
	}

	return {
		user: state,
		fetchUser,
	}
}
