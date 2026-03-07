import { createMApiClient } from '../../client/createClient'
import type { MApiClient } from '../../client/types'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const client: MApiClient = createMApiClient({
    endpoint: config.public.mApiEndpoint,
    headers: () => {
      const authToken = useCookie<string | null>('auth-token').value
      return {
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
      }
    }
  })

  return {
    provide: {
      mapi: client
    }
  }
})
