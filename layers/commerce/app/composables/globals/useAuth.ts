export function useAuth() {
	const { $gateway } = useNuxtApp()
	return (($gateway as any)?.auth || {}) as any
}

export default useAuth
