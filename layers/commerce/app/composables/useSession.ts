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

	const authFactory = (globalThis as any).useSdkAuthAdapter as (() => any) | undefined
	const auth = (typeof authFactory === 'function' ? authFactory() : {}) as any

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
