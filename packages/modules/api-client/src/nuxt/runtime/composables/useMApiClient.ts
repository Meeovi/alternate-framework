import type { MApiClient } from '../../../client/types'

export function useMApiClient(): MApiClient {
  const nuxtApp = useNuxtApp()
  return nuxtApp.$mapi as MApiClient
}
