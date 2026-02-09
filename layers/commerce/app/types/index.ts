// Minimal JSX namespace for legacy React/JSX type references used in the
// commerce layer's migrated code. Kept permissive to avoid introducing
// runtime changes; this only provides compile-time types.
declare global {
  namespace JSX {
    interface Element {}
    interface IntrinsicElements { [elemName: string]: any }
  }
}

import { sdk } from '@mframework/core'

export function createClient(provider?: string, config?: any) {
  // Prefer provider-specific client creation if available on the SDK.
  // Fall back to the SDK's commerce client.
  try {
    // some adapters expose a createClient/init API — delegate when present
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anySdk: any = sdk
    if (typeof anySdk.createClient === 'function') return anySdk.createClient(provider, config)
    if (typeof anySdk.init === 'function') return anySdk.init(config)
  } catch (e) {
    // swallow and fallback
  }

  return sdk.commerce
}

export function init(config?: any) {
  return createClient(undefined, config)
}

export default { createClient, init }
