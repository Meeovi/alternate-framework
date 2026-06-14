import { defu } from 'defu'
import { createAuthClient } from 'better-auth/client'
import type {
  InferSessionFromClient,
  InferUserFromClient,
  BetterAuthClientOptions,
} from 'better-auth/client'
import type { RouteLocationRaw } from 'vue-router'

interface RuntimeAuthConfig {
  redirectUserTo: RouteLocationRaw | string
  redirectGuestTo: RouteLocationRaw | string
}

export function useAuth() {
  const url = useRequestURL()
  const headers = import.meta.server ? useRequestHeaders() : undefined
  const runtimeConfig = useRuntimeConfig()
  const publicAuth = runtimeConfig.public.auth as Partial<RuntimeAuthConfig> & {
    backend?: string
  }
  const backend = String(publicAuth?.backend || 'better-auth').toLowerCase()
  const adapterMode = backend !== 'better-auth'

  const client = createAuthClient({
    baseURL: url.origin,
    fetchOptions: {
      headers,
    },
  })

  const options = defu(publicAuth, {
    redirectUserTo: '/login',
    redirectGuestTo: '/login',
  })
  const session = useState<InferSessionFromClient<BetterAuthClientOptions> | null>('auth:session', () => null)
  const user = useState<InferUserFromClient<BetterAuthClientOptions> | null>('auth:user', () => null)
  const sessionFetching = import.meta.server ? ref(false) : useState('auth:sessionFetching', () => false)

  const setAdapterSession = (data: any) => {
    session.value = data?.session || null
    user.value = data?.user || null
  }

  const fetchAdapterSession = async () => {
    const data = await $fetch<any>('/api/auth/adapter/session', {
      method: 'GET',
      headers,
    })
    setAdapterSession(data)
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

      const { data } = await client.getSession({
        fetchOptions: {
          headers,
          timeout: 15000,
        },
      })
      session.value = data?.session || null
      user.value = data?.user || null
      return data
    } catch (error) {
      console.error('Failed to fetch session', error)
      session.value = null
      user.value = null
      return null
    } finally {
      sessionFetching.value = false
    }
  }

  if (import.meta.client) {
    client.$store.listen('$sessionSignal', async (signal) => {
      if (!signal || adapterMode) return
      await fetchSession()
    })
  }

  return {
    session,
    user,
    loggedIn: computed(() => !!session.value),
    signIn: adapterMode
      ? {
          email: signInAdapter,
        }
      : client.signIn,
    signUp: adapterMode
      ? {
          email: signUpAdapter,
        }
      : client.signUp,
    async signOut({ redirectTo }: { redirectTo?: RouteLocationRaw } = {}) {
      const res = adapterMode ? await signOutAdapter() : await client.signOut()
      session.value = null
      user.value = null
      if (redirectTo) {
        await navigateTo(redirectTo)
      }
      return res
    },
    options,
    fetchSession,
    client,
  }
}
