type AnyRecord = Record<string, any>

export type NotificationsAdapter = {
  listNotifications(args?: Record<string, any>): Promise<any[]>
  getNotificationsSnapshot(args?: Record<string, any>): Promise<{ notifications: any[], unreadCount: number }>
  markNotificationAsRead(id: string, args?: Record<string, any>): Promise<void>
  markAllNotificationsAsRead(args?: Record<string, any>): Promise<void>
}
