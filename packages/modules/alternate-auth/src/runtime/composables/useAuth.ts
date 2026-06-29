import { defu } from 'defu'
import type { RouteLocationRaw } from 'vue-router'
import { signIn, signUp, signOut, useSession, authClient } from './useAuthClient'

interface RuntimeAuthConfig {
  redirectUserTo: RouteLocationRaw | string
  redirectGuestTo: RouteLocationRaw | string
  backend?: string
}

interface AuthSession {
  id?: string
  token?: string
  expiresAt?: Date
  [key: string]: unknown
}

interface AuthUser {
  id?: string
  email?: string | null
  name?: string | null
  role?: string | null
  [key: string]: unknown
}

type UseAuthReturn = {
  session: ReturnType<typeof useState<AuthSession | null>>
  user: ReturnType<typeof useState<AuthUser | null>>
  loggedIn: ReturnType<typeof computed<boolean>>
  client: typeof authClient
  signIn: { email?: (payload: { email?: string; password?: string; rememberMe?: boolean }) => Promise<{ data: any; error: { message: string } | null }> } | typeof signIn
  signUp: { email?: (payload: { email?: string; password?: string; name?: string }) => Promise<{ data: any; error: { message: string } | null }> } | typeof signUp
  signOut: (options?: { redirectTo?: RouteLocationRaw }) => Promise<{ data: any; error: { message: string } | null }>
  options: RuntimeAuthConfig
  fetchSession: () => Promise<any>
}

export function useAuth(): UseAuthReturn {
  const runtimeConfig: { public?: { auth?: Partial<RuntimeAuthConfig> } } = useRuntimeConfig()
  const publicAuth = (runtimeConfig.public?.auth || {}) as Partial<RuntimeAuthConfig>
  const backend = String(publicAuth?.backend || 'better-auth').toLowerCase()
  const adapterMode = backend !== 'better-auth'

  const { data: sessionData } = useSession()
  const headers = import.meta.server ? useRequestHeaders() : undefined

  const session = useState<AuthSession | null>('auth:session', () => null)
  const user = useState<AuthUser | null>('auth:user', () => null)
  const sessionFetching = ref(false)

  watchEffect(() => {
    if (sessionData?.value) {
      session.value = sessionData.value.session
      user.value = sessionData.value.user
    }
  })

  const setAdapterSession = (data: any) => {
    session.value = data?.session || null
    user.value = data?.user || null
  }

  const fetchAdapterSession = async () => {
    const data = await $fetch<any>('/api/auth/adapter/session', {
      method: 'GET',
      headers,
    }).catch(() => null)
    if (data) {
      setAdapterSession(data)
    }
    return data
  }

  const signInAdapter = async (payload: { email?: string; password?: string; rememberMe?: boolean }) => {
    try {
      const data = await $fetch<any>('/api/auth/adapter/sign-in', {
        method: 'POST',
        headers,
        body: payload,
      })
      setAdapterSession(data)
      return { data, error: null }
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error?.data?.message || error?.message || 'Authentication failed',
        },
      }
    }
  }

  const signUpAdapter = async (payload: { email?: string; password?: string; name?: string }) => {
    try {
      const data = await $fetch<any>('/api/auth/adapter/sign-up', {
        method: 'POST',
        headers,
        body: payload,
      })
      setAdapterSession(data)
      return { data, error: null }
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error?.data?.message || error?.message || 'Sign up failed',
        },
      }
    }
  }

  const signOutAdapter = async () => {
    try {
      const data = await $fetch<any>('/api/auth/adapter/sign-out', {
        method: 'POST',
        headers,
      })
      session.value = null
      user.value = null
      return { data, error: null }
    } catch (error: any) {
      session.value = null
      user.value = null
      return {
        data: null,
        error: {
          message: error?.data?.message || error?.message || 'Sign out failed',
        },
      }
    }
  }

  const fetchSession = async () => {
    if (sessionFetching.value) {
      console.log('already fetching session')
      return
    }
    sessionFetching.value = true
    try {
      if (adapterMode) {
        return fetchAdapterSession()
      }
      return { session: session.value, user: user.value }
    } catch (err) {
      console.error('Failed to fetch session', err)
      session.value = null
      user.value = null
      return null
    } finally {
      sessionFetching.value = false
    }
  }

  const options: RuntimeAuthConfig = defu(publicAuth || {}, {
    redirectUserTo: '/login',
    redirectGuestTo: '/login',
    backend: 'better-auth',
  })

  return {
    session,
    user,
    loggedIn: computed(() => !!session.value),
    client: authClient,
    signIn: adapterMode
      ? {
          email: signInAdapter,
        }
      : signIn,
    signUp: adapterMode
      ? {
          email: signUpAdapter,
        }
      : signUp,
    async signOut({ redirectTo }: { redirectTo?: RouteLocationRaw } = {}) {
      const res = adapterMode ? await signOutAdapter() : await signOut()
      session.value = null
      user.value = null
      if (redirectTo) {
        await navigateTo(redirectTo)
      }
      return res
    },
    options,
    fetchSession,
  }
}