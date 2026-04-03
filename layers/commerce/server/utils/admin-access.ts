import type { H3Event } from 'h3'
import { createError } from 'h3'

function getRoles(user: Record<string, any>): string[] {
  const candidates = [
    user.role,
    user.roles,
    user.raw_app_meta_data?.roles,
    user.raw_user_meta_data?.roles,
  ]

  return candidates.flatMap((value) => {
    if (typeof value === 'string') {
      return [value]
    }

    if (Array.isArray(value)) {
      return value.filter((entry): entry is string => typeof entry === 'string')
    }

    return []
  })
}

export async function requireCommerceAdminAccess(event: H3Event) {
  try {
    const authModule = await import('#auth/server/utils/auth')
    const user = await authModule.requireAuth(event)
    const roles = getRoles(user)

    if (!roles.includes('admin')) {
      throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
    }

    return user
  } catch (error: any) {
    if (error?.statusCode === 401 || error?.statusCode === 403) {
      throw error
    }

    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
      message: 'Admin access required.',
    })
  }
}