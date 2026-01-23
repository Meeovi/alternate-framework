import { CartProvider } from "./types"

const providers: Record<string, CartProvider> = {}

export function registerCartProvider(name: string, provider: CartProvider) {
  providers[name] = provider
}

export function getCartProvider(name: string) {
  const provider = providers[name]
  if (!provider) throw new Error(`Cart provider "${name}" not found`)
  return provider
}
