import { defineEventHandler, type H3Event } from 'h3'
import {
  getNotificationGateway,
  resolveNotificationUserId,
} from '../../utils/notifications/hub'

export default defineEventHandler(async (event: any) => {
  const userId = resolveNotificationUserId(event)
  await getNotificationGateway().markAllAsRead(userId)
  return { ok: true }
})
