// Runtime server utilities for authentication
type AnyRecord = Record<string, any>

export async function getServerAuth(event?: any): Promise<AnyRecord | null> {
  try {
    // Attempt to load from alternate-auth if available
    // @ts-ignore - alternate-auth/runtime/server exists but lacks type declarations
    const altAuth = await import(/* @vite-ignore */ '@mframework/alternate-auth/runtime/server').catch(() => null)
    if (altAuth) {
      return await altAuth.getAuth?.(event) || altAuth.auth
    }

    // Fallback: try to resolve from global registry
    const runtime = globalThis as AnyRecord
    const authFactory = runtime.getAuth as any

    if (typeof authFactory === 'function') {
      return await authFactory(event)
    }

    return null
  } catch {
    return null
  }
}
