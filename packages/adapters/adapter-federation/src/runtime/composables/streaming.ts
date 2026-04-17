import { ref, watchEffect, type Ref } from 'vue'
import type { mastodon } from '../../clients/mastodon'

export interface StreamingControls {
  isActive: Ref<boolean>
  pause: () => void
  resume: () => void
}

export interface UseStreamingOptions<Controls extends boolean> {
  controls?: Controls
  immediate?: boolean
}

export interface StreamingToolsDeps {
  getStreamingClient: () => Ref<mastodon.streaming.Client | undefined>
  addFrozenListener?: (cleanup: () => void) => void
  onBeforeUnmount?: (cleanup: () => void) => void
}

export function createStreamingTools(deps: StreamingToolsDeps) {
  function useStreaming(
    cb: (client: mastodon.streaming.Client) => mastodon.streaming.Subscription,
    options: UseStreamingOptions<true>,
  ): { stream: Ref<mastodon.streaming.Subscription | undefined> } & StreamingControls
  function useStreaming(
    cb: (client: mastodon.streaming.Client) => mastodon.streaming.Subscription,
    options?: UseStreamingOptions<false>,
  ): Ref<mastodon.streaming.Subscription | undefined>
  function useStreaming(
    cb: (client: mastodon.streaming.Client) => mastodon.streaming.Subscription,
    { immediate = true, controls }: UseStreamingOptions<boolean> = {},
  ): ({ stream: Ref<mastodon.streaming.Subscription | undefined> } & StreamingControls) | Ref<mastodon.streaming.Subscription | undefined> {
    const streamingClient = deps.getStreamingClient()

    const isActive = ref(immediate)
    const stream = ref<mastodon.streaming.Subscription>()

    function pause() {
      isActive.value = false
    }

    function resume() {
      isActive.value = true
    }

    function cleanup() {
      if (stream.value) {
        stream.value.unsubscribe()
        stream.value = undefined
      }
    }

    watchEffect(() => {
      cleanup()
      if (streamingClient.value && isActive.value)
        stream.value = cb(streamingClient.value)
    })

    deps.addFrozenListener?.(cleanup)
    deps.onBeforeUnmount?.(() => { isActive.value = false })

    if (controls)
      return { stream, isActive, pause, resume }
    return stream
  }

  return {
    useStreaming,
  }
}