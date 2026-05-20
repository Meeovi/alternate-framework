export function useUser() {
	const state = useState<any>('commerce:user', () => null)

	const authFactory = (globalThis as any).useSdkAuthAdapter as (() => any) | undefined
	const auth = (typeof authFactory === 'function' ? authFactory() : {}) as any

	const fetchUser = async (...args: any[]) => {
		const session = await (auth.fetchSession?.(...args) ?? auth.getSession?.(...args) ?? null)
		const user = session?.user ?? auth.user ?? null
		state.value = user
		return user
	}

	return {
		user: state,
		fetchUser,
	}
}
