import { createError, getRequestHeader } from 'h3'
import type { H3Event } from 'h3'

/**
 * Rocket.Chat (collaborrate.com) behind Meeovi discussions.
 *
 * - One public channel per content object: `${prefix}-${type}-${id}`,
 *   created on first open by a signed-in user.
 * - SSO: each Meeovi (better-auth) user gets their own Rocket.Chat account,
 *   username `meeovi-<user id>`, found or created here with the admin
 *   Personal Access Token. Accounts are matched by that username only —
 *   never by email — so a Meeovi login can't take over an existing
 *   collaborrate.com account that happens to share an address.
 * - The embed is logged in with a token from `users.createToken`, cached per
 *   user so each visit doesn't mint a new login token. Rocket.Chat 7+ only
 *   allows that with `secret` = its CREATE_TOKENS_FOR_USERS_SECRET env var
 *   (ROCKETCHAT_CREATE_TOKENS_SECRET here).
 */

type Config = {
  url: string
  admin: { userId: string, token: string, tokenSecret: string }
  types: string[]
  roomPrefix: string
  sessionEndpoint: string
}

export function discussionsConfig(event?: H3Event): Config {
  const runtime = useRuntimeConfig(event) as Record<string, any>
  const own = runtime.meeoviDiscussions ?? {}
  const pub = runtime.public?.meeoviDiscussions ?? {}
  return {
    url: String(pub.url || '').trim().replace(/\/+$/, ''),
    admin: {
      userId: String(own.admin?.userId || '').trim(),
      token: String(own.admin?.token || '').trim(),
      tokenSecret: String(own.admin?.tokenSecret || '').trim(),
    },
    types: own.types ?? [],
    roomPrefix: own.roomPrefix || 'discussion',
    sessionEndpoint: own.sessionEndpoint || '/api/auth/get-session',
  }
}

/** Admin REST call to Rocket.Chat. */
async function rc<T = any>(event: H3Event | undefined, path: string, options: Record<string, any> = {}): Promise<T> {
  const { url, admin } = discussionsConfig(event)
  if (!url || !admin.userId || !admin.token) {
    throw createError({ statusCode: 503, statusMessage: 'Discussions are not configured' })
  }
  return $fetch<T>(`${url}/api/v1/${path}`, {
    timeout: 15000,
    ...options,
    headers: { 'X-User-Id': admin.userId, 'X-Auth-Token': admin.token, ...options.headers },
  })
}

/** Rocket.Chat answers 400 with `{ success: false, error }` for "not found". */
const isNotFound = (e: any) => [400, 404].includes(e?.statusCode ?? e?.status ?? e?.response?.status)

// ---------------------------------------------------------------------------
// Session

export type DiscussionUser = {
  id: string
  name?: string | null
  username?: string | null
  email?: string | null
  emailVerified?: boolean | null
  image?: string | null
}

export async function discussionUser(event: H3Event): Promise<DiscussionUser | null> {
  const cookie = getRequestHeader(event, 'cookie')
  if (!cookie) return null
  try {
    const session = await $fetch<{ user?: DiscussionUser } | null>(discussionsConfig(event).sessionEndpoint, { headers: { cookie } })
    return session?.user?.id ? { ...session.user, id: String(session.user.id) } : null
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Rooms

const SAFE = /[^a-z0-9_.-]+/g

/** `${prefix}-${type}-${id}` within Rocket.Chat's channel-name rules. */
export function roomName(event: H3Event | undefined, type: string, id: string): string {
  const { types, roomPrefix } = discussionsConfig(event)
  const t = type.toLowerCase()
  if (!types.includes(t)) throw createError({ statusCode: 404, statusMessage: 'Unknown discussion type' })
  const cleanId = String(id).toLowerCase().replace(SAFE, '-').replace(/^-+|-+$/g, '').slice(0, 100)
  if (!cleanId) throw createError({ statusCode: 400, statusMessage: 'Invalid discussion id' })
  return `${roomPrefix}-${t}-${cleanId}`
}

type Room = { _id: string, name: string, msgs?: number, topic?: string }
const ROOM_TTL_MS = 60 * 1000
const roomCache = new Map<string, { at: number, room: Room | null }>()

/** The room, or null when nobody has opened this discussion yet. */
export async function findRoom(event: H3Event | undefined, name: string, fresh = false): Promise<Room | null> {
  const hit = roomCache.get(name)
  if (!fresh && hit && Date.now() - hit.at < ROOM_TTL_MS) return hit.room
  let room: Room | null = null
  try {
    room = (await rc<{ channel: Room }>(event, 'channels.info', { query: { roomName: name } })).channel ?? null
  } catch (e) {
    if (!isNotFound(e)) throw e
  }
  roomCache.set(name, { at: Date.now(), room })
  return room
}

export async function ensureRoom(event: H3Event, name: string, title?: string): Promise<Room> {
  const existing = await findRoom(event, name)
  if (existing) return existing
  let room: Room
  try {
    room = (await rc<{ channel: Room }>(event, 'channels.create', { method: 'POST', body: { name, readOnly: false } })).channel
  } catch (e) {
    // Created concurrently by another visitor.
    const again = await findRoom(event, name, true)
    if (again) return again
    throw e
  }
  const topic = String(title ?? '').replace(/\s+/g, ' ').trim().slice(0, 200)
  if (topic) await rc(event, 'channels.setTopic', { method: 'POST', body: { roomId: room._id, topic } }).catch(() => {})
  roomCache.set(name, { at: Date.now(), room })
  return room
}

// ---------------------------------------------------------------------------
// Users + SSO

type RcUser = { _id: string, username: string, name?: string }
const userCache = new Map<string, RcUser>()
const memberCache = new Set<string>()
const TOKEN_TTL_MS = 12 * 60 * 60 * 1000
const tokenCache = new Map<string, { at: number, token: string }>()

export function rcUsername(user: DiscussionUser): string {
  return `meeovi-${user.id.toLowerCase().replace(SAFE, '-')}`.slice(0, 64)
}

async function findRcUser(event: H3Event, username: string): Promise<RcUser | null> {
  try {
    return (await rc<{ user: RcUser }>(event, 'users.info', { query: { username } })).user ?? null
  } catch (e) {
    if (isNotFound(e)) return null
    throw e
  }
}

/** The user's Rocket.Chat account, created on first use. */
export async function ensureRcUser(event: H3Event, user: DiscussionUser): Promise<RcUser> {
  const cached = userCache.get(user.id)
  if (cached) return cached
  const username = rcUsername(user)
  // Shown in Rocket.Chat (UI_Use_Real_Name) instead of the id-based username.
  const name = String(user.name || user.username || 'Meeovi member').slice(0, 80)
  let found = await findRcUser(event, username)
  if (found && found.name !== name) {
    // Renamed on Meeovi since the account was created — keep it in sync.
    await rc(event, 'users.update', { method: 'POST', body: { userId: found._id, data: { name } } }).catch(() => {})
  }
  if (!found) {
    // Placeholder address unless the email is verified on Meeovi — and even
    // then fall back to it if another account already uses the address.
    const placeholder = `${username}@users.meeovi.invalid`
    const emails = user.emailVerified && user.email ? [user.email, placeholder] : [placeholder]
    let lastError: unknown
    for (const email of emails) {
      try {
        found = (await rc<{ user: RcUser }>(event, 'users.create', {
          method: 'POST',
          body: {
            username, name, email, verified: true,
            password: crypto.randomUUID() + crypto.randomUUID(),
            joinDefaultChannels: false, requirePasswordChange: false, sendWelcomeEmail: false,
          },
        })).user
        break
      } catch (e) {
        lastError = e
        found = await findRcUser(event, username) // created concurrently?
        if (found) break
      }
    }
    if (!found) throw lastError
    if (user.image) {
      await rc(event, 'users.setAvatar', { method: 'POST', body: { userId: found._id, avatarUrl: user.image } }).catch(() => {})
    }
  }
  userCache.set(user.id, found)
  return found
}

export async function ensureMember(event: H3Event, room: Room, rcUser: RcUser): Promise<void> {
  const key = `${room._id}:${rcUser._id}`
  if (memberCache.has(key)) return
  await rc(event, 'channels.invite', { method: 'POST', body: { roomId: room._id, userId: rcUser._id } })
  memberCache.add(key)
}

/** A login token for the user's Rocket.Chat account (cached ~12h). */
export async function loginToken(event: H3Event, rcUser: RcUser): Promise<string> {
  const hit = tokenCache.get(rcUser._id)
  if (hit && Date.now() - hit.at < TOKEN_TTL_MS) return hit.token
  const { admin } = discussionsConfig(event)
  const res = await rc<{ data: { authToken: string } }>(event, 'users.createToken', {
    method: 'POST',
    body: { userId: rcUser._id, secret: admin.tokenSecret },
  })
    .catch((e) => {
      console.error('[meeovi-discussions] users.createToken failed — does ROCKETCHAT_CREATE_TOKENS_SECRET match CREATE_TOKENS_FOR_USERS_SECRET on Rocket.Chat?', e?.data?.error || e?.message)
      throw createError({ statusCode: 503, statusMessage: 'Discussions sign-in is unavailable' })
    })
  tokenCache.set(rcUser._id, { at: Date.now(), token: res.data.authToken })
  return res.data.authToken
}

export function embedUrl(event: H3Event | undefined, name: string): string {
  return `${discussionsConfig(event).url}/channel/${encodeURIComponent(name)}?layout=embedded`
}

// ---------------------------------------------------------------------------
// Reading discussions (e.g. seller reviews from product rooms)

export type DiscussionMessage = {
  id: string
  room: string
  topic: string | null
  text: string
  author: string
  date: string | null
}

/**
 * Recent messages from discussions of the given object types, newest first
 * (at most `maxRooms` rooms × `perRoom` messages). System messages are skipped.
 */
export async function recentMessages(
  event: H3Event | undefined,
  types: string[],
  { maxRooms = 50, perRoom = 100 } = {},
): Promise<DiscussionMessage[]> {
  const { roomPrefix } = discussionsConfig(event)
  const prefixes = types.map((t) => `${roomPrefix}-${t.toLowerCase()}-`)
  const rooms: Room[] = []
  for (const prefix of prefixes) {
    const res = await rc<{ rooms: Room[] }>(event, 'rooms.adminRooms', {
      query: { filter: prefix, 'types[]': 'c', count: maxRooms, sort: JSON.stringify({ lm: -1 }) },
    })
    rooms.push(...(res.rooms ?? []).filter((r) => r.name?.startsWith(prefix)))
  }
  const messages: DiscussionMessage[] = []
  for (const room of rooms.slice(0, maxRooms)) {
    if (!room.msgs) continue
    const res = await rc<{ messages: any[] }>(event, 'channels.messages', {
      query: { roomId: room._id, count: perRoom, sort: JSON.stringify({ ts: -1 }) },
    })
    for (const m of res.messages ?? []) {
      if (m.t || !m.msg) continue // joins, topic changes, …
      messages.push({
        id: m._id,
        room: room.name,
        topic: room.topic ?? null,
        text: String(m.msg),
        author: m.u?.name || m.u?.username || '',
        date: m.ts ?? null,
      })
    }
  }
  return messages.sort((a, b) => String(b.date).localeCompare(String(a.date)))
}
