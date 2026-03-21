import type { GraphqlRestTransport } from '../../../client/types'

export function useMApiTransport(): GraphqlRestTransport {
  const nuxtApp = useNuxtApp()
  return nuxtApp.$mapiTransport as GraphqlRestTransport
}