export type AuthUser = {
  id: string
  name?: string | null
  email?: string | null
  role?: string | null
  [key: string]: unknown
}

export function useCurrentUser() {
  const user = useState<AuthUser | null>('currentUser', () => null)
  const config = useRuntimeConfig()
  const cookieName = config?.public?.auth?.cookieName || 'auth-token'
  const token = useCookie<string | null>(cookieName)

  const { data, error } = useFetch<{ profile: AuthUser | null }>('/api/profile/route', {
    method: 'GET',
    immediate: Boolean(token.value),
    watch: [token],
  })

  watchEffect(() => {
    if (!token.value) {
      user.value = null
      return
    }

    const profile = (data.value as { profile?: AuthUser } | null | undefined)?.profile
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
