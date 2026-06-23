import type { NotificationsAdapter } from './notifications-types'
import type { NotificationsSnapshot } from './notifications-types'

type AnyRecord = Record<string, any>

function resolveGatewayNotifications(): AnyRecord {
  const runtime = globalThis as AnyRecord
  const gatewayFactory = runtime.useGateway

  if (typeof gatewayFactory !== 'function') {
    return {}
  }

  try {
    const gateway = gatewayFactory() as AnyRecord
    return (gateway?.notifications as AnyRecord) || {}
  } catch {
    return {}
  }
}

export function useNotificationsAdapter(): NotificationsAdapter {
  const notifications = resolveGatewayNotifications()

  const listNotifications = async (args: AnyRecord = {}): Promise<any[]> => {
    const fn = notifications?.listNotifications ?? notifications?.getNotifications ?? notifications?.list
    if (typeof fn !== 'function') return []

    const result = await fn(args)
    if (!Array.isArray(result)) return []
    return result.map((notification: AnyRecord) => ({
      id: String(notification.id || ''),
      title: String(notification.title || ''),
      body: String(notification.body || ''),
      category: String(notification.category || 'info'),
      read: Boolean(notification.read),
      createdAt: notification.createdAt || new Date().toISOString(),
      actionUrl: notification.actionUrl ? String(notification.actionUrl) : undefined,
      source: notification.source ? String(notification.source) : 'system',
      actions: Array.isArray(notification.actions) ? notification.actions : undefined,
      metadata: notification.metadata && typeof notification.metadata === 'object' ? notification.metadata : undefined,
    }))
  }

  const getNotificationsSnapshot = async (args: AnyRecord = {}): Promise<NotificationsSnapshot> => {
    const fn = notifications?.getNotificationsSnapshot ?? notifications?.getSnapshot ?? notifications?.snapshot
    if (typeof fn === 'function') {
      const result = await fn(args)
      const items = Array.isArray(result?.notifications)
        ? result.notifications.map((n: AnyRecord) => ({
            id: String(n.id || ''),
            title: String(n.title || ''),
            body: String(n.body || ''),
            category: String(n.category || 'info'),
            read: Boolean(n.read),
            createdAt: n.createdAt || new Date().toISOString(),
            actionUrl: n.actionUrl ? String(n.actionUrl) : undefined,
            source: n.source ? String(n.source) : 'system',
            actions: Array.isArray(n.actions) ? n.actions : undefined,
            metadata: n.metadata && typeof n.metadata === 'object' ? n.metadata : undefined,
          }))
        : []

      return {
        notifications: items,
        unreadCount: typeof result?.unreadCount === 'number' ? result.unreadCount : items.filter((i: any) => !i.read).length,
      }
    }

    const items = await listNotifications(args)
    return {
      notifications: items,
      unreadCount: items.filter((notification: any) => !notification.read).length,
    }
  }

  const markNotificationAsRead = async (id: string, args: AnyRecord = {}) => {
    const fn = notifications?.markNotificationAsRead ?? notifications?.markAsRead
    if (typeof fn === 'function') {
      await fn(id, args)
    }
  }

  const markAllNotificationsAsRead = async (args: AnyRecord = {}) => {
    const fn = notifications?.markAllNotificationsAsRead ?? notifications?.markAllAsRead
    if (typeof fn === 'function') {
      await fn(args)
    }
  }

  return {
    listNotifications,
    getNotificationsSnapshot,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  }
}
