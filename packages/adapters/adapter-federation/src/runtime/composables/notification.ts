import { computed, reactive, watch } from 'vue'
import type { mastodon } from '../../clients/mastodon'

type NotificationBucket = [Promise<mastodon.streaming.Subscription>, string[]]

export interface NotificationToolsDeps {
  currentUser: { value: any }
  isHydrated: { value: boolean }
  useMasto: () => {
    client: { value: mastodon.rest.Client }
    streamingClient: { value: mastodon.streaming.Client | undefined }
  }
  onHydrated: (cb: () => void) => void
  untilTruthy: (getValue: () => unknown) => Promise<void>
}

export function createNotificationTools(deps: NotificationToolsDeps) {
  const notifications = reactive<Record<string, NotificationBucket | undefined>>({})

  function useNotifications() {
    const id = deps.currentUser.value?.account?.id as string | undefined
    const { client, streamingClient } = deps.useMasto()

    async function clearNotifications() {
      if (!id || !notifications[id])
        return

      const lastReadId = notifications[id]![1][0]
      notifications[id]![1] = []

      if (lastReadId) {
        await client.value.v1.markers.create({
          notifications: { lastReadId },
        })
      }
    }

    async function processNotifications(stream: mastodon.streaming.Subscription, accountId: string) {
      for await (const entry of stream) {
        if (entry.event === 'notification' && notifications[accountId])
          notifications[accountId]![1].unshift(entry.payload.id)
      }
    }

    async function connect(): Promise<void> {
      if (!deps.isHydrated.value || !id || notifications[id] !== undefined || !deps.currentUser.value?.token)
        return

      let resolveStream: ((value: mastodon.streaming.Subscription | PromiseLike<mastodon.streaming.Subscription>) => void) | undefined
      const streamPromise = new Promise<mastodon.streaming.Subscription>(resolve => resolveStream = resolve)
      notifications[id] = [streamPromise, []]

      await deps.untilTruthy(() => streamingClient.value)

      const stream = streamingClient.value!.user.subscribe()
      resolveStream!(stream)

      void processNotifications(stream, id)

      const position = await client.value.v1.markers.fetch({ timeline: ['notifications'] })
      const paginator = client.value.v1.notifications.list({ limit: 30 })
      const paginatorValues = paginator.values()

      while (true) {
        const result = await paginatorValues.next()
        if (!result.done && result.value.length) {
          for (const notification of result.value) {
            if (notification.id === position.notifications.lastReadId)
              return
            notifications[id]![1].push(notification.id)
          }
        }
        else {
          break
        }
      }
    }

    function disconnect(): void {
      if (!id || !notifications[id])
        return
      void notifications[id]![0].then(stream => stream.unsubscribe())
      notifications[id] = undefined
    }

    watch(deps.currentUser, disconnect)

    deps.onHydrated(() => {
      void connect()
    })

    return {
      notifications: computed(() => id ? notifications[id]?.[1].length ?? 0 : 0),
      clearNotifications,
    }
  }

  return {
    useNotifications,
  }
}
