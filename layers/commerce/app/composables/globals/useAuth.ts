export function useAuth() {
	const authFactory = (globalThis as any).useSdkAuthAdapter as (() => any) | undefined
	if (typeof authFactory !== 'function') return {}
	return authFactory()
}

export default useAuth
