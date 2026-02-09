import type { AuthProvider } from './types.js'

// allow missing entries in the map so TypeScript understands runtime checks
const providers: Record<string, AuthProvider | undefined> = {}
let activeProvider: any | null = null

export function registerAuthProvider(name: string, provider: AuthProvider) {
  providers[name] = provider
}

export function setActiveAuthProvider(name: string) {
  if (!providers[name]) {
    throw new Error(`Auth provider "${name}" is not registered`)
  }
  activeProvider = name
}

export function getAuthProvider(): AuthProvider {
  if (!activeProvider) {
    throw new Error('No active auth provider has been set')
  }
  const prov = providers[activeProvider!]
  if (!prov) throw new Error(`Auth provider "${activeProvider}" not found`)
  return prov
}