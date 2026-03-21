import { createMApiClient } from '../../client/createClient'
import type { MApiClient } from '../../client/types'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()

  const client: MApiClient = createMApiClient({
    endpoint: config.public.mApiEndpoint,
    headers: () => {
      const headers = useRequestHeaders(['cookie', 'authorization'])
      const authToken = headers.authorization || ''
      return {
        ...(authToken ? { Authorization: authToken } : {})
      }
    }
  })

  return {
    provide: {
      mapi: client
    }
  }
})
