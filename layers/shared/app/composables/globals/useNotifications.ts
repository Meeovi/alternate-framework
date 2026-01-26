import { ref, onMounted } from 'vue'
import { useAsyncData, useNuxtApp } from '#imports'

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
  const { $directus, $readItems, $updateItem } = useNuxtApp() as any

  // Fetch notifications from Directus
  const fetchDirectusNotifications = async () => {
    try {
      const { data } = await useAsyncData<any[]>('directusNotifications', () => {
        return $directus.request($readItems('notifications', {
          filter: {
            recipient: { _eq: 'current_user' }
          },
          sort: ['-date_created']
        }))
      })
      
      if (data.value) {
        const formattedNotifications: Notification[] = data.value.map((notification: any) => ({
          id: String(notification.id),
          title: String(notification.subject),
          content: String(notification.message),
          date: String(notification.timestamp),
          type: (['order', 'account', 'social', 'system'].includes(notification.collection) ? notification.collection : 'system') as Notification['type'],
          isRead: notification.status === 'read',
          source: 'directus',
          payload: notification.item
        }))
        notifications.value = [...notifications.value, ...formattedNotifications]
      }
    } catch (error) {
      console.error('Error fetching Directus notifications:', error)
    }
  }

  // Fetch notifications from Magento
  const fetchMagentoNotifications = async () => {
    try {
      // Replace with your Magento API endpoint
      const response = await fetch('/api/magento/notifications')
      if (!response.ok) {
        const text = await response.text().catch(() => '')
        console.error('Magento notifications fetch failed', { status: response.status, body: text })
        return
      }

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
  const markAsRead = async (notificationId: string, source: 'magento' | 'directus') => {
    try {
      if (source === 'directus') {
        await $directus.request($updateItem('notifications', notificationId, {
          status: 'read'
        }))
      } else {
        // Update Magento notification
        await fetch(`/api/magento/notifications/${notificationId}/read`, {
          method: 'POST'
        })
      }
      
      // Update local state
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
      // Update Directus notifications
      await $directus.request($updateItem('notifications', {
        filter: {
          recipient: { _eq: 'current_user' },
          status: { _eq: 'inbox' }
        },
        data: {
          status: 'read'
        }
      }))

      // Update Magento notifications
      await fetch('/api/magento/notifications/read-all', {
        method: 'POST'
      })

      // Update local state
      notifications.value.forEach(notification => {
        notification.isRead = true
      })
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