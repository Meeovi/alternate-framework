export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
}

export interface Notification {
  id: string
  message: string
  type: NotificationType
  meta?: Record<string, unknown>
  createdAt: number
}

export type NotificationOptions = Partial<Pick<Notification, 'meta' | 'type'>>
