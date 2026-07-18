import { ref, computed, watch } from 'vue'
import { useNuxtApp, useRuntimeConfig } from 'nuxt/app'
import { useAuth } from '#auth/app/composables/useAuth'
import { createDirectus, rest, readItems, updateItem, deleteItem } from '@directus/sdk'

export interface UserNotification {
  id: string
  title: string
  body: string
  category: string
  read: boolean
  createdAt: string
  source: string
  payload?: Record<string, any>
}

function createDirectusClient(url?: string) {
  if (!url) return null
  return createDirectus(url).with(rest())
}

function mapDirectusNotification(item: any): UserNotification {
  return {
    id: String(item.id || ''),
    title: String((item.payload && item.payload.subject) || item.type || 'Notification'),
    body: String(item.content || ''),
    category: String(item.type || 'info'),
    read: Boolean(item.is_read),
    createdAt: item.date_created || new Date().toISOString(),
    source: 'directus',
    payload: item.payload && typeof item.payload === 'object' ? item.payload : undefined,
  }
}

export function useUserNotifications() {
  const nuxtApp = useNuxtApp()
  const config = useRuntimeConfig()

  const auth = useAuth()
  const session = auth.useSession ? auth.useSession() : ref(null)
  const user = computed(() => session.value?.data?.user)

  const directus = (nuxtApp.$directus as any) || createDirectusClient((config.public as any)?.directus?.url)

  const notifications = ref<UserNotification[]>([])
  const unreadCount = computed(() => notifications.value.filter((n) => !n.read).length)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchNotifications = async () => {
    if (!directus || !user.value?.id) {
      notifications.value = []
      return
    }

    loading.value = true
    error.value = null
    try {
      const userId = String(user.value.id)
      const items = await directus.request(
        readItems('notifications', {
          filter: { recipient: { _eq: userId } },
          sort: '-date_created',
          fields: ['id', 'content', 'is_read', 'type', 'date_created', 'date_updated', 'payload'],
        }),
      )
      notifications.value = (items as any[]).map(mapDirectusNotification)
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      loading.value = false
    }
  }

  watch(() => user.value?.id, fetchNotifications, { immediate: true })

  const markAsRead = async (id: string) => {
    const notification = notifications.value.find((n) => n.id === id)
    if (notification && directus) {
      notification.read = true
      try {
        await directus.request(updateItem('notifications', id, { is_read: true }))
      } catch {
        notification.read = false
      }
    }
  }

  const markAllAsRead = async () => {
    if (!directus || !user.value?.id) return
    const unread = notifications.value.filter((n) => !n.read)
    for (const n of unread) {
      n.read = true
    }
    try {
      await Promise.all(
        unread.map((n) =>
          directus.request(updateItem('notifications', n.id, { is_read: true })),
        ),
      )
    } catch {
      for (const n of unread) {
        n.read = false
      }
    }
  }

  const dismiss = async (id: string) => {
    notifications.value = notifications.value.filter((n) => n.id !== id)
    if (directus) {
      try {
        await directus.request(deleteItem('notifications', id))
      } catch {
        // Could refetch here
      }
    }
  }

  const refresh = () => fetchNotifications()

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    dismiss,
    refresh,
  }
}
