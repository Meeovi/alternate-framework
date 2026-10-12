import { createError, defineEventHandler, getRequestHeader, readBody } from 'h3'
import type { MessagesMember } from '../../runtime/types'
import { discussionUser, openDirectConversation } from '../utils/rocketchat'

const ID = /^[A-Za-z0-9_-]{1,64}$/

/**
 * POST {apiBase}/messages { userId } — start (or reopen) a private
 * conversation with another member. The member is looked up through the
 * app's members endpoint, so only real members can be messaged and their
 * Rocket.Chat name/avatar come from their Meeovi profile.
 */
export default defineEventHandler(async (event): Promise<{ rid: string }> => {
  const user = await discussionUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Sign in to send messages' })

  const body = await readBody<{ userId?: unknown }>(event).catch(() => null)
  const userId = String(body?.userId ?? '')
  if (!ID.test(userId)) throw createError({ statusCode: 400, statusMessage: 'Choose who to message' })

  const endpoint = (useRuntimeConfig(event) as Record<string, any>).meeoviDiscussions?.membersEndpoint || '/api/social/members'
  const member = await $fetch<MessagesMember>(`${endpoint}/${encodeURIComponent(userId)}`, {
    headers: { cookie: getRequestHeader(event, 'cookie') || '' },
  }).catch(() => null)
  if (!member?.id) throw createError({ statusCode: 404, statusMessage: "That member couldn't be found" })

  return openDirectConversation(event, user, { id: String(member.id), name: member.name, username: member.username, image: member.image })
})
