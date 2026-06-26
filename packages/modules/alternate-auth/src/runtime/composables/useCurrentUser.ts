export function useCurrentUser(): AuthUser {
  const user = useState<AuthUser>('currentUser', () => null)
  const config = useRuntimeConfig()
  const cookieName = ((config?.public as any)?.auth?.cookieName as string | undefined) || 'auth-token'
  const backend = String((config?.public as any)?.auth?.backend || 'better-auth').toLowerCase()
  const adapterMode = backend !== 'better-auth'
  const token = useCookie<string | null>(cookieName)

  const profileEndpoint = adapterMode ? '/api/auth/adapter/session' : '/api/profile/route'

  const { data, error } = useFetch<any>(profileEndpoint, {
    method: 'GET',
    immediate: Boolean(token.value),
    watch: [token],
  })

  watchEffect(() => {
    if (!token.value) {
      user.value = null
      return
    }

    const payload = data.value as any
    const profile = adapterMode ? (payload?.user || null) : (payload?.profile || null)
    if (profile) {
      user.value = profile
      return
    }

    if (error.value) {
      user.value = null
    }
  })

  return user
}