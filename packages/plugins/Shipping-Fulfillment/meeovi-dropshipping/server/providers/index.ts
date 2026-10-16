import type { ProviderId } from '../../runtime/types'
import { cj } from './cj'
import { printful } from './printful'
import type { SupplierProvider } from './types'

export * from './types'

const PROVIDERS: Record<ProviderId, SupplierProvider> = { printful, cj }

export function getProvider(id: string): SupplierProvider | undefined {
  return Object.hasOwn(PROVIDERS, id) ? PROVIDERS[id as ProviderId] : undefined
}

export const providerIds = Object.keys(PROVIDERS) as ProviderId[]
