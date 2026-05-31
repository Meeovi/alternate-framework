import { createStarterTransport } from './src/transport'
import { createStarterAuthAdapter } from './src/auth'
import { createStarterCommerceAdapter } from './src/commerce'
import { createStarterSearchAdapter } from './src/search'
import {
  createAdapterInstaller,
  defineAdapterLayerFactories,
} from './src/patterns'
import { createStarterGatewayClient } from './utils/client'
import { handleStarterAdapterError } from './utils/errors'
import { normalizeStarterSearchResult } from './utils/normalizers'
import type { StarterGatewayAdapterContract, StarterSearchResult } from './types'

export interface StarterAdapterOptions {
  baseUrl?: string
  apiKey?: string
}

const starterLayerFactories = defineAdapterLayerFactories({
  auth: createStarterAuthAdapter,
  commerce: createStarterCommerceAdapter,
  search: createStarterSearchAdapter,
})

export const installStarterAdapter = createAdapterInstaller(
  createStarterTransport,
  starterLayerFactories,
)

export class StarterAdapter implements StarterGatewayAdapterContract {
  private readonly transport

  constructor(options: StarterAdapterOptions = {}) {
    this.transport = createStarterGatewayClient(options)
  }

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
      return handleStarterAdapterError(error)
    }
  }
}

export const createGatewayAdapterBindings = (options: StarterAdapterOptions = {}) => ({
  starter: {
    adapter: new StarterAdapter(options)
  }
})