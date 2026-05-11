import { inject } from 'vue'
import { GatewayKey } from '../injection/keys'
import type { GatewayContract } from '../contracts/gateway'

export function useGateway(): GatewayContract {
  const gateway = inject(GatewayKey)

  if (!gateway) {
    throw new Error(
      '[@mframework/core] Gateway not provided. ' +
        'Provide GatewayKey in your app (e.g. via a Nuxt plugin or root app setup).'
    )
  }

  return gateway
}
