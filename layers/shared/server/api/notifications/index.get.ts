import { defineEventHandler } from 'h3'
import { NotificationsSnapshotSchema, toWire } from '../../../shared/notifications/schema'
import {
  getNotificationGateway,
  resolveNotificationUserId,
} from '../../utils/notifications/hub'

export default defineEventHandler(async (event: any) => {
  const userId = resolveNotificationUserId(event)
  const notifications = await getNotificationGateway().list(userId, event)

  const snapshot = NotificationsSnapshotSchema.parse({
    notifications: notifications.map(toWire),
    unreadCount: notifications.filter((item) => !item.read).length,
  })

  return snapshot
})
