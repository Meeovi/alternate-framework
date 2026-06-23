import { ref, onMounted } from 'vue'
import { useNuxtApp } from '#imports'
import { useNotificationsAdapter } from './useNotificationsAdapter'

export function useSdkNotifications() {
  const { $sdk } = useNuxtApp()
  const adapter = useNotificationsAdapter()

  const notifications = ref([])
  const unreadCount = ref(0)

  const loadNotifications = async () => {
    const list = await adapter.listNotifications()
    notifications.value = list
    unreadCount.value = list.filter(n => !n.read).length
  }

  const markAsRead = async (id, source) => {
    await adapter.markNotificationAsRead(id, { source })
    await loadNotifications()
  }

  onMounted(loadNotifications)

  return {
    notifications,
    unreadCount,
    markAsRead
  }
}
