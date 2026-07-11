import type { NotificationsSnapshot, UnifiedNotification } from './types.js'
import { normalizeNotification, normalizeNotificationsSnapshot } from './types.js'
import { NotifyAdapterRegistry } from '../contracts/notification.js'

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

export function useNotificationsAdapter(): AnyRecord {
  const registryAdapter = NotifyAdapterRegistry.getDefaultAdapter()
  const notifications = registryAdapter ? { ...registryAdapter } : resolveGatewayNotifications()

  const notify = async (payload: AnyRecord): Promise<void> => {
    const fn = notifications?.notify
    if (typeof fn === 'function') {
      await fn(payload)
    }
  }

  const dismiss = async (id: string): Promise<void> => {
    const fn = notifications?.dismiss ?? notifications?.delete
    if (typeof fn === 'function') {
      await fn(id)
    }
  }

  const clear = async (): Promise<void> => {
    const fn = notifications?.clear ?? notifications?.deleteAll
    if (typeof fn === 'function') {
      await fn()
    }
  }

  const listNotifications = async (args: AnyRecord = {}): Promise<UnifiedNotification[]> => {
    const fn = notifications?.listNotifications ?? notifications?.getNotifications ?? notifications?.list
    if (typeof fn !== 'function') return []

    const result = await fn(args)
    if (!Array.isArray(result)) return []
    return result.map((notification: AnyRecord) => normalizeNotification(notification || {}))
  }

  const getNotificationsSnapshot = async (args: AnyRecord = {}): Promise<NotificationsSnapshot> => {
    const fn = notifications?.getNotificationsSnapshot ?? notifications?.getSnapshot ?? notifications?.snapshot
    if (typeof fn === 'function') {
      const result = await fn(args)
      return normalizeNotificationsSnapshot((result as AnyRecord) || {})
    }

    const items = await listNotifications(args)
    return {
      notifications: items,
      unreadCount: items.filter((notification) => !notification.read).length,
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
    notify,
    dismiss,
    clear,
    listNotifications,
    getNotificationsSnapshot,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  }
}

export function useNotify(): AnyRecord {
  return useNotificationsAdapter()
}

export default useNotificationsAdapter