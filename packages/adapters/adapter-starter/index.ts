import {
  setAuthAdapter,
  setCommerceAdapter,
  setSearchAdapter
} from '@mframework/core'

import { createStarterTransport } from './src/transport'
import { createStarterAuthAdapter } from './src/auth'
import { createStarterCommerceAdapter } from './src/commerce'
import { createStarterSearchAdapter } from './src/search'
import { createStarterGatewayClient } from './utils/client'
import { handleStarterAdapterError } from './utils/errors'
import { normalizeStarterSearchResult } from './utils/normalizers'
import type { StarterGatewayAdapterContract, StarterSearchResult } from './types'

export const installStarterAdapter = (config: { baseUrl: string; apiKey?: string }) => {
  const transport = createStarterTransport(config)

  setAuthAdapter(createStarterAuthAdapter(transport))
  setCommerceAdapter(createStarterCommerceAdapter(transport))
  setSearchAdapter(createStarterSearchAdapter(transport))
}

export class StarterAdapter implements StarterGatewayAdapterContract {
  private readonly transport = createStarterGatewayClient()

  health(): string {
    return 'ok'
  }

  async search(query: string): Promise<StarterSearchResult> {
    try {
      const response = await this.transport.request<any>('POST', '/search', {
        body: { query }
      })
      return normalizeStarterSearchResult(response.data)
    } catch (error) {
      handleStarterAdapterError(error)
    }
  }
}

export const createGatewayAdapterBindings = () => ({
  starter: {
    adapter: new StarterAdapter()
  }
})