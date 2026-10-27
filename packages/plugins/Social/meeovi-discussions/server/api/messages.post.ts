import { createError, defineEventHandler, getRequestHeader, readBody } from 'h3'
import type { MessagesMember } from '../../runtime/types'
import { discussionUser, openDirectConversation, sendDirectMessage } from '../utils/rocketchat'

const ID = /^[A-Za-z0-9_-]{1,64}$/
/** Longest first message accepted here (Rocket.Chat's own default limit is 5000). */
const MAX_TEXT = 2000

/**
 * POST {apiBase}/messages { userId, text? } — start (or reopen) a private
 * conversation with another member, and send `text` in it when given (e.g. a
 * birthday wish). The member is looked up through the app's members
 * endpoint, so only real members can be messaged and their Rocket.Chat
 * name/avatar come from their Meeovi profile.
 */
export default defineEventHandler(async (event): Promise<{ rid: string }> => {
  const user = await discussionUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Sign in to send messages' })

  const body = await readBody<{ userId?: unknown, text?: unknown }>(event).catch(() => null)
  const userId = String(body?.userId ?? '')
  if (!ID.test(userId)) throw createError({ statusCode: 400, statusMessage: 'Choose who to message' })
  const text = typeof body?.text === 'string' ? body.text.trim() : ''
  if (text.length > MAX_TEXT) throw createError({ statusCode: 400, statusMessage: `Messages can be up to ${MAX_TEXT} characters` })

  const endpoint = (useRuntimeConfig(event) as Record<string, any>).meeoviDiscussions?.membersEndpoint || '/api/social/members'
  const member = await $fetch<MessagesMember>(`${endpoint}/${encodeURIComponent(userId)}`, {
    headers: { cookie: getRequestHeader(event, 'cookie') || '' },
  }).catch(() => null)
  if (!member?.id) throw createError({ statusCode: 404, statusMessage: "That member couldn't be found" })

  const other = { id: String(member.id), name: member.name, username: member.username, image: member.image }
  return text ? sendDirectMessage(event, user, other, text) : openDirectConversation(event, user, other)
})
