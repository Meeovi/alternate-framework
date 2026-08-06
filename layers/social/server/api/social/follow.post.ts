import { and, eq } from 'drizzle-orm'
import { db } from '#auth/server/utils/drizzle'
import { follows } from '#auth/server/database/migrations/schema'

const { auth } = useNuxtApp() as any

export default defineEventHandler(async (event) => {
  // 1. Guard route using Better Auth session context
  const session = await auth.api.getSession({ headers: event.node.req.headers })
  if (!session) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  const userId = session.user.id
  const body = await readBody(event)
  
  const { targetId, targetType } = body // targetType: 'user' | 'space'

  if (!targetId || !['user', 'space'].includes(targetType)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid payload Parameters' })
  }

  // Prevent self-following loops if target is a user
  if (targetType === 'user' && targetId === userId) {
    throw createError({ statusCode: 400, statusMessage: 'You cannot follow yourself' })
  }

  // 2. Check if relationship already exists
  const existingFollow = await db.select().from(follows).where(
    and(
      eq(follows.followerId, userId),
      eq(follows.targetId, targetId),
      eq(follows.targetType, targetType)
    )
  ).limit(1)

  if (existingFollow.length > 0) {
    // Unfollow action
    await db.delete(follows).where(
      and(
        eq(follows.followerId, userId),
        eq(follows.targetId, targetId),
        eq(follows.targetType, targetType)
      )
    )
    return { following: false, message: 'Successfully unfollowed' }
  } else {
    // Follow action
    await db.insert(follows).values({
      followerId: userId,
      targetId,
      targetType
    })
    
    // NOTE: This is where you trigger Better Notify to alert targetId if targetType === 'user'
    
    return { following: true, message: 'Successfully followed' }
  }
})