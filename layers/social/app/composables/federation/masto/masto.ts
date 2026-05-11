import type { UserLogin } from '../../../../../shared/shared/types'
import type { Pausable } from '@vueuse/core'
import type { mastodon } from '@mframework/adapter-federation'
import type { Ref } from 'vue'
import { tryOnBeforeUnmount } from '@vueuse/core'
import { currentUser, getInstanceCache, instanceStorage } from '../../contacts/users'
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
  const client = useMasto().client.value
  if (!client)
    throw new Error('Mastodon client is not initialized')
  return client
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
    user: { ...user, token: user.token || '' },
    getInstanceCache: getInstanceCache as any,
    instanceStorage: { value: instanceStorage as any },
    currentUser,
    webSocketImplementation: globalThis.WebSocket,
  } as any)

  return instance
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

  if (controls)
    return streamingTools.useStreaming(cb, { immediate, controls: true }) as unknown as ({ stream: Ref<mastodon.streaming.Subscription | undefined> } & Pausable)

  return streamingTools.useStreaming(cb, { immediate, controls: false }) as unknown as Ref<mastodon.streaming.Subscription | undefined>
}
