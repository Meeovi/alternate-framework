import { defineEventHandler } from 'h3'
import {
  getNotificationGateway,
  resolveNotificationUserId,
} from '../../utils/notifications/hub'

export default defineEventHandler(async (event) => {
  const userId = resolveNotificationUserId(event)
  await getNotificationGateway().markAllAsRead(userId)
  return { ok: true }
})
