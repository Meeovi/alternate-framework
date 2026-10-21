import { timingSafeEqual } from 'node:crypto'
import { createError, defineEventHandler, readBody, setResponseStatus } from 'h3'
import { deleteMessage, muteInRoom, rcUserInfo } from '@mframework/meeovi-discussions/server'
import { checkSpam } from '../../../../../shared/server/utils/spam'

/**
 * POST /api/social/discussions/moderate — Rocket.Chat's outgoing webhook
 * ("Message Sent", every channel, group and direct message) calls this for
 * each new message; comments are Rocket.Chat discussions, so this is the
 * comment spam filter. Spam (server/utils/spam.ts in the shared layer) is
 * deleted straight away; a third deletion within a day also mutes the
 * author in that room.
 *
 * Set up with packages/plugins/Scripts/rocketchat-spam-webhook.mjs; the
 * integration's token is NUXT_MEEOVI_DISCUSSIONS_MODERATION_TOKEN here.
 * Answers 204 so Rocket.Chat posts no reply.
 */
type OutgoingMessage = {
  token?: string
  bot?: unknown
  message_id?: string
  channel_id?: string
  user_id?: string
  user_name?: string
  text?: string
}

const STRIKE_WINDOW_MS = 24 * 60 * 60 * 1000
const STRIKES_BEFORE_MUTE = 3
const strikes = new Map<string, number[]>()

const sameSecret = (a: string, b: string) => {
  const x = Buffer.from(a)
  const y = Buffer.from(b)
  return x.length === y.length && timingSafeEqual(x, y)
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event) as { meeoviDiscussions?: { moderationToken?: string, admin?: { userId?: string } } }
  const secret = String(config.meeoviDiscussions?.moderationToken || '')
  const body = await readBody<OutgoingMessage>(event).catch(() => null)
  if (!secret || !body?.token || !sameSecret(String(body.token), secret)) {
    throw createError({ statusCode: 401, statusMessage: 'Unknown webhook' })
  }
  setResponseStatus(event, 204)

  const { message_id: messageId, channel_id: roomId, user_id: userId, text } = body
  if (!messageId || !roomId || !userId || !text || body.bot) return null
  // The app's own admin account posts system notices.
  if (userId === config.meeoviDiscussions?.admin?.userId) return null

  const author = await rcUserInfo(event, userId)
  const createdAt = author?.createdAt ? new Date(author.createdAt).getTime() : NaN
  const verdict = checkSpam(text, {
    authorId: `rc:${userId}`,
    scope: roomId,
    accountAgeHours: Number.isFinite(createdAt) ? (Date.now() - createdAt) / 3_600_000 : null,
  })
  if (!verdict.spam) return null

  await deleteMessage(event, roomId, messageId).catch((e) => {
    console.error(`[spam] could not delete message ${messageId} in ${roomId}`, e?.data?.error || e?.message)
  })
  const now = Date.now()
  const recent = (strikes.get(userId) ?? []).filter((at) => now - at < STRIKE_WINDOW_MS)
  recent.push(now)
  strikes.set(userId, recent)
  if (strikes.size > 10_000) {
    for (const [id, times] of strikes) if (!times.some((at) => now - at < STRIKE_WINDOW_MS)) strikes.delete(id)
  }
  console.warn(`[spam] deleted message ${messageId} by ${author?.username ?? userId} in ${roomId} (strike ${recent.length}): ${verdict.reasons.join(', ')}`)
  if (recent.length >= STRIKES_BEFORE_MUTE) {
    await muteInRoom(event, roomId, userId).catch((e) => {
      console.error(`[spam] could not mute ${userId} in ${roomId}`, e?.data?.error || e?.message)
    })
  }
  return null
})
