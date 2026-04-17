import { defineEventHandler, createError } from 'h3'
import { requireAuth } from '../utils/auth'

export default defineEventHandler(async (event) => {
  const path = event.path

  if (path?.startsWith('/api/admin')) {
    const user = await requireAuth(event)
    if (user.role !== 'admin') {
      throw createError({ statusCode: 403, statusMessage: 'Forbidden', message: 'Admin access required.' })
    }
  }
})