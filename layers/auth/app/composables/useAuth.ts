import { defu } from 'defu'
import { createAuthClient } from 'better-auth/client'
import type {
  InferSessionFromClient,
  InferUserFromClient,
  ClientOptions,
} from 'better-auth/client'
import type { RouteLocationRaw } from 'vue-router'

interface RuntimeAuthConfig {
  redirectUserTo: RouteLocationRaw | string
  redirectGuestTo: RouteLocationRaw | string
}

export function useAuth() {
  const url = useRequestURL()
  const headers = import.meta.server ? useRequestHeaders() : undefined
  const config = useRuntimeConfig()
  const backend = String((config.public as any)?.auth?.backend || 'better-auth').toLowerCase()
  const useAdapterBridge = backend !== 'better-auth'

  const client = createAuthClient({
    baseURL: url.origin,
    fetchOptions: {
      headers,
    },
  })

  const options = defu(config.public.auth as Partial<RuntimeAuthConfig>, {
    redirectUserTo: '/',
    redirectGuestTo: '/',
  })
  const session = useState<InferSessionFromClient<ClientOptions> | null>('auth:session', () => null)
  const user = useState<InferUserFromClient<ClientOptions> | null>('auth:user', () => null)
  const sessionFetching = import.meta.server ? ref(false) : useState('auth:sessionFetching', () => false)

  const fetchSession = async () => {
    if (sessionFetching.value) {
      console.log('already fetching session')
      return
    }
    sessionFetching.value = true
    if (useAdapterBridge) {
      try {
        const data = await $fetch<{ session?: any; user?: any }>('/api/auth/adapter/session', {
          method: 'GET',
          headers: headers as any,
        })
        session.value = data?.session || null
        user.value = data?.user || null
      } catch {
        session.value = null
        user.value = null
      }
      sessionFetching.value = false
      return { session: session.value, user: user.value }
    }

    const { data } = await client.getSession({
      fetchOptions: {
        headers,
      },
    })
    session.value = data?.session || null
    user.value = data?.user || null
    sessionFetching.value = false
    return data
  }

  if (import.meta.client) {
    client.$store.listen('$sessionSignal', async (signal) => {
      if (!signal) return
      await fetchSession()
    })
  }

  const adapterSignInEmail = async (payload: { email: string; password: string }) => {
    try {
      const data = await $fetch<{ session?: any; user?: any }>('/api/auth/adapter/sign-in', {
        method: 'POST',
        body: payload,
        headers: headers as any,
      })
      session.value = data?.session || null
      user.value = data?.user || null
      return { data, error: null as any }
    } catch (error: any) {
      return { data: null as any, error: { message: error?.data?.statusMessage || error?.message || 'Sign in failed' } }
    }
  }

  const adapterSignUpEmail = async (payload: { email: string; password: string; name?: string; image?: string }) => {
    try {
      const data = await $fetch<{ session?: any; user?: any }>('/api/auth/adapter/sign-up', {
        method: 'POST',
        body: payload,
        headers: headers as any,
      })
      session.value = data?.session || null
      user.value = data?.user || null
      return { data, error: null as any }
    } catch (error: any) {
      return { data: null as any, error: { message: error?.data?.statusMessage || error?.message || 'Sign up failed' } }
    }
  }

  const signIn = {
    ...(client.signIn as any),
    email: useAdapterBridge ? adapterSignInEmail : (client.signIn as any).email,
  }

  const signUp = {
    ...(client.signUp as any),
    email: useAdapterBridge ? adapterSignUpEmail : (client.signUp as any).email,
  }

  return {
    session,
    user,
    loggedIn: computed(() => !!session.value),
    signIn,
    signUp,
    async signOut({ redirectTo }: { redirectTo?: RouteLocationRaw } = {}) {
      const res = useAdapterBridge
        ? await $fetch('/api/auth/adapter/sign-out', { method: 'POST', headers: headers as any })
        : await client.signOut()
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