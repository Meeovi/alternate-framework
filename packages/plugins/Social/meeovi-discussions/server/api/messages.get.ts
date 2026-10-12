import { createError, defineEventHandler } from 'h3'
import type { MessagesConversation } from '../../runtime/types'
import { discussionUser, listDirectConversations } from '../utils/rocketchat'

/** GET {apiBase}/messages — the signed-in member's private conversations. */
export default defineEventHandler(async (event): Promise<{ conversations: MessagesConversation[] }> => {
  const user = await discussionUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Sign in to see your messages' })
  return { conversations: await listDirectConversations(event, user) }
})
