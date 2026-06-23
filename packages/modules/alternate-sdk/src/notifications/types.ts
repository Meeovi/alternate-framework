export type NotificationCategory = string

export interface NotificationAction {
  id: string
  label: string
  kind?: 'navigate' | 'api' | string
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | string
}

export interface UnifiedNotification {
  id: string
  title: string
  body: string
  category: NotificationCategory
  read?: boolean
  createdAt: string | Date
  actionUrl?: string
  source?: string
  actions?: NotificationAction[]
  metadata?: Record<string, unknown>
}

export interface NotificationsSnapshot {
  notifications: UnifiedNotification[]
  unreadCount: number
}

export interface NotificationsAdapter {
  listNotifications(args?: Record<string, any>): Promise<UnifiedNotification[]>
  getNotificationsSnapshot(args?: Record<string, any>): Promise<NotificationsSnapshot>
  markNotificationAsRead(id: string, args?: Record<string, any>): Promise<void>
  markAllNotificationsAsRead(args?: Record<string, any>): Promise<void>
}

export function normalizeNotification(input: Record<string, any>): UnifiedNotification {
  return {
    id: String(input.id || ''),
    title: String(input.title || ''),
    body: String(input.body || ''),
    category: String(input.category || 'info'),
    read: Boolean(input.read),
    createdAt: input.createdAt || new Date().toISOString(),
    actionUrl: input.actionUrl ? String(input.actionUrl) : undefined,
    source: input.source ? String(input.source) : 'system',
    actions: Array.isArray(input.actions) ? input.actions : undefined,
    metadata: input.metadata && typeof input.metadata === 'object' ? input.metadata : undefined,
  }
}

export function normalizeNotificationsSnapshot(input: Record<string, any>): NotificationsSnapshot {
  const notifications = Array.isArray(input.notifications)
    ? input.notifications.map((notification) => normalizeNotification(notification || {}))
    : []

  return {
    notifications,
    unreadCount:
      typeof input.unreadCount === 'number'
        ? input.unreadCount
        : notifications.filter((notification) => !notification.read).length,
  }
}