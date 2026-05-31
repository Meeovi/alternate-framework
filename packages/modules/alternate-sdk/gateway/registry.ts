export interface GatewayRegistry {
  register(domain: string, provider: string, factory: (config?: any) => any): void
  resolve(domain: string, provider: string): ((config?: any) => any) | null
  list(): Record<string, Record<string, (config?: any) => any>>
}

export function createGatewayRegistry(): GatewayRegistry {
  const adapters: Record<string, Record<string, (config?: any) => any>> = {}

  return {
    register(domain, provider, factory) {
      if (!adapters[domain]) adapters[domain] = {}
      adapters[domain][provider] = factory
    },

    resolve(domain, provider) {
      return adapters[domain]?.[provider] || null
    },

    list() {
      return adapters
    },
  }
}
