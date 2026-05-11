import type { CartProvider } from "./types"

const providers: Record<string, CartProvider> = {}

export function registerCartProvider(name: string, provider: CartProvider) {
  providers[name] = provider
}

export function getCartProvider(name: string) {
  const provider = providers[name]
  if (!provider) throw new Error(`Cart provider "${name}" not found`)
  return provider
}

// Runtime helper for adapter packages to register themselves when the
// app boots. Adapter packages can import this and call it from their
// plugin entry to wire into the commerce cart provider registry.
export function registerCartProviderRuntime(name: string, provider: CartProvider) {
  registerCartProvider(name, provider)
}
