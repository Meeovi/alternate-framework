import { shallowRef, Ref } from 'vue'

// Runtime-safe streaming composable. Layers can import from alternate-gateway/core
// and will get a safe fallback when no streaming client is available.
export function useStreaming(p0: (client: {
  public: any; user: {
  notification: any; subscribe: () => any; 
}; }) => any): { streamingClient: Ref<any>; connect: (opts?: any) => Promise<any>; disconnect: () => void } {
  const maybeGlobal = (globalThis as any).useStreamingClient || (globalThis as any).streamingClient
  if (typeof maybeGlobal === 'function') {
    try {
      const res = maybeGlobal()
      return { streamingClient: res.streamingClient ?? (res as any).client ?? shallowRef(null), connect: res.connect ?? (async () => null), disconnect: res.disconnect ?? (() => {}) }
    } catch (e) {
      // fallthrough to fallback
    }
  }

  // Fallback surface: no-op streaming client
  const streamingClient = shallowRef<any>(null)
  async function connect(_opts?: any) {
    return null
  }
  function disconnect() {
    /* noop */
  }
  return { streamingClient, connect, disconnect }
}

export default useStreaming
