import type {
  AuthAdapter,
  CommerceAdapter,
  SearchAdapter,
  TransportAdapter,
} from 'alternate-gateway/core/adapters'

import {
  setAuthAdapter,
  setCommerceAdapter,
  setSearchAdapter,
} from 'alternate-gateway/core/registry'

export type AdapterInstallConfig = {
  baseUrl: string
  apiKey?: string
}

export type AdapterLayerMap = {
  auth: AuthAdapter
  commerce: CommerceAdapter
  search: SearchAdapter
}

export type AdapterLayer = keyof AdapterLayerMap

export type AdapterLayerFactories = {
  [K in AdapterLayer]?: (transport: TransportAdapter) => AdapterLayerMap[K]
}

const layerInstallers: {
  [K in AdapterLayer]: (adapter: AdapterLayerMap[K]) => void
} = {
  auth: setAuthAdapter,
  commerce: setCommerceAdapter,
  search: setSearchAdapter,
}

export const defineAdapterLayerFactories = (factories: AdapterLayerFactories) => factories

export const createAdapterInstaller = (
  createTransport: (config: AdapterInstallConfig) => TransportAdapter,
  factories: AdapterLayerFactories,
) => {
  return (config: AdapterInstallConfig) => {
    const transport = createTransport(config)

    for (const layer of Object.keys(factories) as AdapterLayer[]) {
      const factory = factories[layer]
      if (!factory) continue
      const adapter = factory(transport)
      layerInstallers[layer](adapter as never)
    }

    return transport
  }
}
