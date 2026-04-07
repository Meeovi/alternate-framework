import { z } from 'zod'

export const NotificationCategorySchema = z.enum(['info', 'assignment', 'alert'])
export type NotificationCategory = z.infer<typeof NotificationCategorySchema>

export const NotificationActionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  kind: z.enum(['navigate', 'api']).default('navigate'),
  url: z.string().min(1),
  method: z.enum(['GET', 'POST']).optional(),
})
export type NotificationAction = z.infer<typeof NotificationActionSchema>

export const UnifiedNotificationSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  body: z.string().min(1),
  category: NotificationCategorySchema,
  read: z.boolean().default(false),
  createdAt: z.coerce.date(),
  actionUrl: z.string().optional(),
  source: z.string().default('system'),
  actions: z.array(NotificationActionSchema).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})
export type UnifiedNotification = z.infer<typeof UnifiedNotificationSchema>

export const UnifiedNotificationWireSchema = UnifiedNotificationSchema.extend({
  createdAt: z.string().min(1),
})
export type UnifiedNotificationWire = z.infer<typeof UnifiedNotificationWireSchema>

export const NotificationsSnapshotSchema = z.object({
  notifications: z.array(UnifiedNotificationWireSchema),
  unreadCount: z.number().int().min(0),
})
export type NotificationsSnapshot = z.infer<typeof NotificationsSnapshotSchema>

export function toWire(notification: UnifiedNotification): UnifiedNotificationWire {
  return {
    ...notification,
    createdAt: notification.createdAt.toISOString(),
  }
}

export function fromWire(notification: UnifiedNotificationWire): UnifiedNotification {
  const parsed = UnifiedNotificationWireSchema.parse(notification)
  return UnifiedNotificationSchema.parse({
    ...parsed,
    createdAt: new Date(parsed.createdAt),
  })
}

export function normalizeNotification(input: unknown): UnifiedNotification {
  return UnifiedNotificationSchema.parse(input)
}
