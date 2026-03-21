import { ref, Ref, shallowRef } from 'vue'

function getNuxtMasto() {
  try {
    // Prefer runtime-provided composable if available; avoid referencing
    // auto-imported symbols directly so tsc in other packages doesn't error.
    const maybeUseNuxt = (globalThis as any).useNuxtApp
    if (typeof maybeUseNuxt === 'function') {
      const nuxt = maybeUseNuxt() as any
      return nuxt?.$masto ?? (globalThis as any).$masto
    }
    return (globalThis as any).$masto
  } catch {
    return undefined
  }
}

export function useMastoClient(): { client: Ref<any>; isReady: Ref<boolean>; v1: any } {
  const remote = getNuxtMasto()
  if (remote) {
    // remote is expected to expose { client: Ref, streamingClient }
    const cli = remote.client ?? remote
    const clientRef = cli && (cli.value !== undefined || cli._isRef) ? cli : ref(cli)
    const isReady = ref(Boolean(clientRef?.value))
    const v1 = new Proxy(
      {},
      {
        get(_t, prop: string) {
          const c = clientRef.value
          return c?.v1?.[prop] ?? c?.[prop]
        },
      },
    )
    return { client: clientRef as Ref<any>, isReady, v1 }
  }

  // Fallback: provide a safe no-op client surface
  const client = shallowRef<any>(null)
  const isReady = ref(false)
  const v1 = {}
  return { client, isReady, v1 }
}

export function useMasto(): { client: Ref<any>; streamingClient: Ref<any> | undefined } {
  const remote = getNuxtMasto()
  if (remote) {
    return { client: remote.client ?? ref(null), streamingClient: remote.streamingClient }
  }
  return { client: shallowRef(null), streamingClient: undefined }
}

export async function mastoLogin(baseUrl: string, token?: string): Promise<void> {
  // Integrate with Nuxt app masto if possible — otherwise noop
  const remote = getNuxtMasto()
  if (remote && typeof remote.login === 'function') {
    return remote.login({ baseUrl, token })
  }
  // no-op fallback
  return Promise.resolve()
}
