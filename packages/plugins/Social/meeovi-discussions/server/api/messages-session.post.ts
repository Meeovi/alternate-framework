import { createError, defineEventHandler } from 'h3'
import type { MessagesSession } from '../../runtime/types'
import { discussionUser, discussionsConfig, ensureRcUser, loginToken } from '../utils/rocketchat'

/** POST {apiBase}/messages/session — a login token for the messages embed. */
export default defineEventHandler(async (event): Promise<MessagesSession> => {
  const user = await discussionUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Sign in to see your messages' })
  const rcUser = await ensureRcUser(event, user)
  return { token: await loginToken(event, rcUser), url: discussionsConfig(event).url }
})
