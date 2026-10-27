import { createError, defineEventHandler } from 'h3'
import { discussionUser, memberComments, type MemberComment } from '../utils/rocketchat'

/**
 * GET {apiBase}/comments — the signed-in member's own recent comments across
 * discussions (e.g. for a "Memories" page), newest first. An empty list if
 * Rocket.Chat can't be reached, so a page's section just stays empty.
 */
export default defineEventHandler(async (event): Promise<{ comments: MemberComment[] }> => {
  const user = await discussionUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Sign in to see your comments' })
  try {
    return { comments: await memberComments(event, user) }
  } catch (error) {
    console.error('[discussions] comments read failed:', (error as Error)?.message ?? error)
    return { comments: [] }
  }
})
