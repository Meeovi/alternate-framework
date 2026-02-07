import { getCartProvider } from './registry'
import useRuntimeConfig from '~/types'

export function useCart() {
  const _cfg: any = (typeof (useRuntimeConfig as any) === 'function') ? (useRuntimeConfig as any)() : (useRuntimeConfig || { public: {} })
  const providerName = (_cfg && _cfg.public && _cfg.public.cartProvider) ? _cfg.public.cartProvider : 'directus'
  const provider = getCartProvider(providerName)

  return {
    getCart: provider.getCart,
    addItem: provider.addItem,
    removeItem: provider.removeItem,
    clearCart: provider.clearCart
  }
}
