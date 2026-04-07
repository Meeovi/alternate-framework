import { createError, defineEventHandler, getRouterParam } from 'h3'
import {
  getNotificationGateway,
  resolveNotificationUserId,
} from '../../../utils/notifications/hub'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Notification id is required.' })
  }

  const userId = resolveNotificationUserId(event)
  await getNotificationGateway().markAsRead(userId, id)

  return { ok: true }
})
