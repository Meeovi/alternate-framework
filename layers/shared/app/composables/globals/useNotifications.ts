import { ref, onMounted } from 'vue'
import { useAsyncData, useNuxtApp } from 'nuxt/app'
import useContent from '../useContent'

export interface Notification {
  id: string
  title: string
  content: string
  date: string
  type: 'order' | 'account' | 'social' | 'system'
  isRead: boolean
  source: 'magento' | 'directus'
  payload?: any
}

export function useNotifications() {
  const notifications = ref<Notification[]>([])
  const unreadCount = ref(0)
  const nuxt = useNuxtApp() as any
  const { request, readItems, updateItem } = useContent()

  // Resolve a runtime notifications provider if one is registered by an adapter.
  // Provider shape (optional methods):
  // - fetchNotifications(): Promise<Notification[]>
  // - markRead(id)
  // - markAll()
  const runtimeProvider: any = (globalThis as any).__notificationsProvider ?? null

  function formatDirectusItems(items: any[]): Notification[] {
    return items.map((notification: any) => ({
      id: String(notification.id),
      title: String(notification.subject),
      content: String(notification.message),
      date: String(notification.timestamp),
      type: (['order', 'account', 'social', 'system'].includes(notification.collection) ? notification.collection : 'system') as Notification['type'],
      isRead: notification.status === 'read',
      source: 'directus',
      payload: notification.item
    }))
  }

  // Fetch notifications from Directus
  const fetchDirectusNotifications = async () => {
    try {
      const { data } = await useAsyncData<any[]>('directusNotifications', () => {
        return readItems('notifications', {
          filter: {
            recipient: { _eq: 'current_user' }
          },
          sort: ['-date_created']
        })
      })

      if (data.value) {
        notifications.value = [...notifications.value, ...formatDirectusItems(data.value)]
      }
    } catch (error) {
      console.error('Error fetching Directus notifications:', error)
    }
  }

  // Fetch notifications from Magento
  const fetchMagentoNotifications = async () => {
    try {
      const response = await fetch('/api/magento/notifications')
      if (!response.ok) return
      const data = await response.json()
      const formattedNotifications: Notification[] = data.map((notification: any) => ({
        id: String(notification.id),
        title: String(notification.title),
        content: String(notification.message),
        date: String(notification.created_at),
        type: (['order', 'account', 'social', 'system'].includes(notification.type) ? notification.type : 'system') as Notification['type'],
        isRead: Boolean(notification.is_read),
        source: 'magento',
        payload: notification.payload
      }))
      notifications.value = [...notifications.value, ...formattedNotifications]
    } catch (error: any) {
      console.error('Error fetching Magento notifications:', error?.message ?? String(error))
    }
  }

  // Mark notification as read
  const markAsRead = async (notificationId: string, source?: 'magento' | 'directus') => {
    try {
      // If a runtime provider is present, delegate
      if (runtimeProvider && typeof runtimeProvider.markRead === 'function') {
        await runtimeProvider.markRead(notificationId)
      } else if (source === 'directus') {
        await updateItem('notifications', notificationId, { status: 'read' })
      } else if (source === 'magento') {
        await fetch(`/api/magento/notifications/${notificationId}/read`, { method: 'POST' })
      }

      const notification = notifications.value.find(n => n.id === notificationId)
      if (notification) {
        notification.isRead = true
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      if (runtimeProvider && typeof runtimeProvider.markAll === 'function') {
        await runtimeProvider.markAll()
      } else {
        // Update Directus notifications
        await updateItem('notifications', {
          filter: {
            recipient: { _eq: 'current_user' },
            status: { _eq: 'inbox' }
          },
          data: {
            status: 'read'
          }
        } as any, null)

        // Update Magento notifications (best-effort fallback)
        try {
          await fetch('/api/magento/notifications/read-all', { method: 'POST' })
        } catch (_) {}
      }

      notifications.value.forEach(notification => { notification.isRead = true })
      unreadCount.value = 0
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  // Calculate unread count
  const updateUnreadCount = () => {
    unreadCount.value = notifications.value.filter(n => !n.isRead).length
  }

  onMounted(async () => {
    await Promise.all([
      fetchDirectusNotifications(),
      fetchMagentoNotifications()
    ])
    updateUnreadCount()
  })

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    updateUnreadCount
  }
} 