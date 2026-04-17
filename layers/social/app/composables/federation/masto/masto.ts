import type { UserLogin } from 'alternate-gateway/core/shared/types'
import type { Pausable } from '@vueuse/core'
import type { mastodon } from '@mframework/adapter-federation'
import type { Ref } from 'vue'
import type { ElkInstance } from '../../contacts/users'
import {
  createFederationState,
  createStreamingTools,
  loginMastodonSession,
} from '@mframework/adapter-federation'

export function createMasto() {
  return createFederationState()
}
export type ElkMasto = ReturnType<typeof createMasto>

export function useMasto() {
  return useNuxtApp().$masto as ElkMasto
}
export function useMastoClient() {
  return useMasto().client.value
}

// ── adapter-federation branded aliases ────────────────────────────────────────
/** Preferred alias — useMasto() backed by @mframework/adapter-federation */
export const useFederation = useMasto
/** Preferred alias — returns the active mastodon.rest.Client from adapter-federation */
export const useFederationClient = useMastoClient
export type ElkFederation = ElkMasto

export function mastoLogin(masto: ElkMasto, user: Pick<UserLogin, 'server' | 'token'>) {
  const instance = loginMastodonSession({
    masto,
    user,
    getInstanceCache,
    instanceStorage,
    currentUser,
    webSocketImplementation: globalThis.WebSocket,
  })

  return instance as ElkInstance
}

interface UseStreamingOptions<Controls extends boolean> {
  /**
   * Expose more controls
   *
   * @default false
   */
  controls?: Controls
  /**
   * Connect on calling
   *
   * @default true
   */
  immediate?: boolean
}

export function useStreaming(
  cb: (client: mastodon.streaming.Client) => mastodon.streaming.Subscription,
  options: UseStreamingOptions<true>,
): { stream: Ref<mastodon.streaming.Subscription | undefined> } & Pausable
export function useStreaming(
  cb: (client: mastodon.streaming.Client) => mastodon.streaming.Subscription,
  options?: UseStreamingOptions<false>,
): Ref<mastodon.streaming.Subscription | undefined>
export function useStreaming(
  cb: (client: mastodon.streaming.Client) => mastodon.streaming.Subscription,
  { immediate = true, controls }: UseStreamingOptions<boolean> = {},
): ({ stream: Ref<mastodon.streaming.Subscription | undefined> } & Pausable) | Ref<mastodon.streaming.Subscription | undefined> {
  const streamingTools = createStreamingTools({
    getStreamingClient: () => useMasto().streamingClient,
    addFrozenListener: (cleanup) => {
      if (import.meta.client && !process.test)
        (useNuxtApp() as any).$pageLifecycle?.addFrozenListener(cleanup)
    },
    onBeforeUnmount: cleanup => tryOnBeforeUnmount(cleanup),
  })

  return streamingTools.useStreaming(cb, { immediate, controls }) as ({ stream: Ref<mastodon.streaming.Subscription | undefined> } & Pausable) | Ref<mastodon.streaming.Subscription | undefined>
}
