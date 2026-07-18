import { AuthAdapterRegistry } from 'alternate-sdk'

type AnyRecord = Record<string, any>

function resolveGatewayAuth(): AnyRecord {
  const runtime = globalThis as AnyRecord
  const gatewayFactory = runtime.useGateway

  if (typeof gatewayFactory !== 'function') {
    return {}
  }

  try {
    const gateway = gatewayFactory() as AnyRecord
    return (gateway?.auth as AnyRecord) || {}
  } catch {
    return {}
  }
}

export function useAuth() {
  const registryAdapter = AuthAdapterRegistry.getDefaultAdapter()
  const auth = registryAdapter ? { ...registryAdapter } : resolveGatewayAuth()

  return {
    login: (payload: AnyRecord) => auth?.login?.(payload) ?? auth?.signIn?.(payload),
    logout: () => auth?.logout?.(),
    getSession: () => auth?.getSession?.(),
    getProfile: () => auth?.getProfile?.(),
    updateProfile: (payload: AnyRecord) => auth?.updateProfile?.(payload),
    register: (payload: AnyRecord) => auth?.register?.(payload) ?? auth?.signUp?.(payload),
    getAdapter: () => auth,
  }
}
