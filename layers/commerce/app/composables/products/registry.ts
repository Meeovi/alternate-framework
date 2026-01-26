import { ProductProvider } from "./types"

const providers: Record<string, ProductProvider> = {}

export function registerProductProvider(name: string, provider: ProductProvider) {
  providers[name] = provider
}

export function getProductProvider(name: string) {
  const provider = providers[name]
  if (!provider) throw new Error(`Product provider "${name}" not found`)
  return provider
}
