// modules/experience-builder/server/policies/permissions.ts
import { createError, type H3Event } from 'h3'

export interface AuthUser {
  id: string
  roles: string[]
}

export async function getAuthUser (event: H3Event): Promise<AuthUser | null> {
  return event.context.user || null
}

export async function assertCanEditEntity (
  event: H3Event,
  entityType: string,
  entityId: string
) {
  const user = await getAuthUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthenticated' })

  // You can route this to your existing ACL:
  // e.g. checkSpaceRole, checkShopRole, checkUserProfileOwner, etc.
  const allowed = await event.context.acl?.canEdit({
    entityType,
    entityId,
    userId: user.id
  })

  if (!allowed) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  return user
}
