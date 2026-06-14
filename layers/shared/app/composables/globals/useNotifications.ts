import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useNotificationsAdapter, type UnifiedNotification } from 'alternate-sdk/notifications'

export function useNotifications() {
  const notifications = ref<UnifiedNotification[]>([])
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const connected = ref(false)
  const notificationsAdapter = useNotificationsAdapter()

  const unreadCount = computed(
    () => notifications.value.filter((n: UnifiedNotification) => !n.read).length,
  )

  async function fetchNotifications() {
    loading.value = true
    error.value = null
    try {
      const data = await notificationsAdapter.getNotificationsSnapshot().catch(() => null)
      if (data) {
        notifications.value = data.notifications ?? []
        return
      }

      const fallback = await $fetch('/api/notifications')
      notifications.value = (fallback as any)?.notifications ?? []
    } catch (err) {
      error.value = err as Error
    } finally {
      loading.value = false
    }
  }

  async function markAsRead(id: string) {
    await notificationsAdapter.markNotificationAsRead(id).catch(async () => {
      await $fetch(`/api/notifications/${id}/read`, { method: 'POST' })
    })
    const target = notifications.value.find((n: UnifiedNotification) => n.id === id)
    if (target) target.read = true
  }

  async function markAllAsRead() {
    await notificationsAdapter.markAllNotificationsAsRead().catch(async () => {
      await $fetch('/api/notifications/read-all', { method: 'POST' })
    })
    notifications.value.forEach((n: UnifiedNotification) => { n.read = true })
  }

  let eventSource: EventSource | null = null

  function startStream() {
    if (typeof EventSource === 'undefined') return
    eventSource = new EventSource('/api/notifications/stream')

    eventSource.addEventListener('ready', () => { connected.value = true })

    eventSource.addEventListener('snapshot', (e) => {
      connected.value = true
      try {
        const payload = JSON.parse(e.data)
        notifications.value = payload.notifications ?? []
      } catch (_) {}
    })

    eventSource.addEventListener('error', () => {
      connected.value = false
      eventSource?.close()
      setTimeout(startStream, 10_000)
    })
  }

  function stopStream() {
    connected.value = false
    eventSource?.close()
    eventSource = null
  }

  onMounted(() => { fetchNotifications(); startStream() })
  onUnmounted(() => { stopStream() })

  return {
    notifications,
    unreadCount,
    loading,
    error,
    connected,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  }
}
