import { createError, defineEventHandler, getRouterParam, readBody } from 'h3'
import type { DiscussionSession } from '../../runtime/types'
import { discussionUser, embedUrl, ensureMember, ensureRcUser, ensureRoom, loginToken, roomName } from '../utils/rocketchat'

/**
 * POST {apiBase}/:type/:id/session — for the signed-in user: create the
 * room if needed (titled with `title` from the body), make sure they have a
 * Rocket.Chat account and are a member, and return a login token for the
 * embed.
 */
export default defineEventHandler(async (event): Promise<DiscussionSession> => {
  const room = roomName(event, getRouterParam(event, 'type') ?? '', getRouterParam(event, 'id') ?? '')
  const user = await discussionUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Sign in to join the discussion' })

  const body = await readBody<{ title?: unknown }>(event).catch(() => null)
  const channel = await ensureRoom(event, room, typeof body?.title === 'string' ? body.title : undefined)
  const rcUser = await ensureRcUser(event, user)
  await ensureMember(event, channel, rcUser)
  return { room, token: await loginToken(event, rcUser), embedUrl: embedUrl(event, room) }
})
