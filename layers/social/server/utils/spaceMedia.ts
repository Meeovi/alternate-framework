// Audio-only / video-only discussions for Audio and Video spaces.
//
// Each such space has a private Rocket.Chat group, `space-media-<space id>`,
// that only its members are added to. Members listen, watch and post voice
// or video messages through Meeovi (components/features/spaceSections/
// SpaceMediaDiscussion.vue); nothing else is shown, and anything that isn't
// allowed media (e.g. typed text) is removed when the feed is read.
//
// Who counts as a member of a space:
//  - anyone who joined it (a `follows` row: target_type 'space'),
//  - its owner and its Directus `members` (Directus accounts, matched to the
//    Meeovi account by a verified email),
//  - site admins.
// Space admins (site admins and the owner) can remove anyone's message;
// members can remove their own.
import { createDirectus, readItem, readItems, rest, staticToken } from '@directus/sdk'
import { createError, type H3Event } from 'h3'
import { requireAuth } from '#auth/server/utils/sessions'
import {
  asMember,
  deleteMessage,
  ensureGroup,
  ensureGroupMember,
  rcUsername,
  removeGroupMember,
  type DiscussionUser,
} from '@mframework/meeovi-discussions/server'

export type SpaceMediaKind = 'audio' | 'video'

export const SPACE_MEDIA_LIMITS: Record<SpaceMediaKind, number> = {
  audio: 25 * 1024 * 1024,
  video: 100 * 1024 * 1024,
}

const directus = createDirectus(process.env.DIRECTUS_URL!)
  .with(rest())
  .with(staticToken(process.env.NUXTUS_DIRECTUS_STATIC_TOKEN!))

type SpaceInfo = { id: string, name: string, kinds: SpaceMediaKind[], ownerEmail: string | null, memberEmails: string[] }
const SPACE_TTL_MS = 60 * 1000
const spaceCache = new Map<string, { at: number, space: SpaceInfo | null }>()

async function loadSpace(id: string): Promise<SpaceInfo | null> {
  const hit = spaceCache.get(id)
  if (hit && Date.now() - hit.at < SPACE_TTL_MS) return hit.space
  const row = await directus.request(readItem('spaces', id, {
    fields: ['id', 'name', 'owner.email', 'members.directus_users_id.email', 'space_type.space_types_id.name'] as any,
  })).catch(() => null) as Record<string, any> | null
  const space = row ? {
    id: String(row.id),
    name: String(row.name || 'Space'),
    kinds: [...new Set((row.space_type ?? [])
      .map((t: any) => String(t?.space_types_id?.name || '').toLowerCase())
      .filter((n: string): n is SpaceMediaKind => n === 'audio' || n === 'video'))] as SpaceMediaKind[],
    ownerEmail: row.owner?.email ? String(row.owner.email).toLowerCase() : null,
    memberEmails: (row.members ?? []).map((m: any) => String(m?.directus_users_id?.email || '').toLowerCase()).filter(Boolean),
  } : null
  spaceCache.set(id, { at: Date.now(), space })
  return space
}

const isSiteAdmin = (user: Record<string, any>) =>
  String(user.role || '').split(',').map((r) => r.trim()).includes('admin')

async function hasJoined(userId: string, spaceId: string): Promise<boolean> {
  const rows = await directus.request(readItems('follows', {
    filter: { follower_id: { _eq: userId }, target_type: { _eq: 'space' }, target_id: { _eq: spaceId } },
    fields: ['id'],
    limit: 1,
  })).catch(() => [])
  return Array.isArray(rows) && rows.length > 0
}

export type SpaceMediaAccess = {
  space: SpaceInfo
  user: DiscussionUser & Record<string, any>
  member: boolean
  admin: boolean
}

/** The signed-in user's access to a space's media discussion (401/404 otherwise). */
export async function spaceMediaAccess(event: H3Event, spaceId: string): Promise<SpaceMediaAccess> {
  const user = await requireAuth(event) as Record<string, any>
  if (!/^\d{1,12}$/.test(spaceId)) throw createError({ statusCode: 404, statusMessage: 'Space not found' })
  const space = await loadSpace(spaceId)
  if (!space) throw createError({ statusCode: 404, statusMessage: 'Space not found' })
  if (!space.kinds.length) throw createError({ statusCode: 404, statusMessage: 'This space has no audio or video discussion' })

  const email = user.emailVerified && user.email ? String(user.email).toLowerCase() : null
  const siteAdmin = isSiteAdmin(user)
  const owner = Boolean(email && email === space.ownerEmail)
  const member = siteAdmin || owner
    || Boolean(email && space.memberEmails.includes(email))
    || await hasJoined(String(user.id), space.id)
  return {
    space,
    user: { ...user, id: String(user.id) } as SpaceMediaAccess['user'],
    member,
    admin: siteAdmin || owner,
  }
}

/** Same, but members only (403 for everyone else). */
export async function requireSpaceMember(event: H3Event, spaceId: string): Promise<SpaceMediaAccess> {
  const access = await spaceMediaAccess(event, spaceId)
  if (!access.member) throw createError({ statusCode: 403, statusMessage: 'Join this space to listen, watch and post' })
  return access
}

/** The space's private group, with the member in it, and a REST caller as them. */
export async function spaceRoom(event: H3Event, access: SpaceMediaAccess) {
  const group = await ensureGroup(event, roomName(access.space.id), access.space.name)
  const me = await asMember(event, access.user)
  await ensureGroupMember(event, group, me.rcUser)
  return { group, me }
}

const roomName = (spaceId: string) => `space-media-${spaceId}`

// Non-members checked recently (so viewing the join prompt doesn't call
// Rocket.Chat every time).
const REVOKE_TTL_MS = 10 * 60 * 1000
const revokedAt = new Map<string, number>()

/**
 * Take someone who is no longer a member out of the space's room — after they
 * leave the space, or when the feed finds they've lost membership another way
 * (e.g. removed from the space's members in Directus). Owners, listed members
 * and site admins stay in. Best-effort: never throws.
 */
export async function revokeSpaceMedia(event: H3Event, spaceId: string, access?: SpaceMediaAccess): Promise<boolean> {
  try {
    const a = access ?? await spaceMediaAccess(event, spaceId)
    if (a.member) return false
    const key = `${a.space.id}:${a.user.id}`
    const at = revokedAt.get(key)
    if (!access || !at || Date.now() - at > REVOKE_TTL_MS) {
      revokedAt.set(key, Date.now())
      return await removeGroupMember(event, roomName(a.space.id), a.user)
    }
    return false
  } catch {
    return false // not a media space, not signed in, or Rocket.Chat unreachable
  }
}

// ---------------------------------------------------------------------------
// Messages

export type SpaceMediaMessage = {
  id: string
  kind: SpaceMediaKind
  /** Same-origin URL that streams the file (members only). */
  src: string
  type: string
  name: string
  author: { name: string, avatar: string }
  at: string
  mine: boolean
  canDelete: boolean
}

/** The message's audio/video file, if it has one of the allowed kinds. */
export function mediaOf(message: any, kinds: SpaceMediaKind[]): { id: string, name: string, type: string, kind: SpaceMediaKind } | null {
  const files: any[] = [...(message.files ?? []), ...(message.file ? [message.file] : [])]
  for (const f of files) {
    const type = String(f?.type || '').toLowerCase()
    const kind = type.split('/')[0] as SpaceMediaKind
    if (f?._id && kinds.includes(kind)) return { id: String(f._id), name: String(f.name || 'media'), type, kind }
  }
  return null
}

export function toSpaceMediaMessage(message: any, access: SpaceMediaAccess, url: string): SpaceMediaMessage | null {
  const media = mediaOf(message, access.space.kinds)
  if (!media) return null
  const mine = message.u?.username === rcUsername(access.user)
  return {
    id: String(message._id),
    kind: media.kind,
    src: `/api/social/spaces/${access.space.id}/media/file/${encodeURIComponent(media.id)}/${encodeURIComponent(media.name)}`,
    type: media.type,
    name: media.name,
    author: {
      name: String(message.u?.name || message.u?.username || 'Member'),
      avatar: `${url}/avatar/${encodeURIComponent(String(message.u?.username || ''))}`,
    },
    at: String(message.ts),
    mine,
    canDelete: mine || access.admin,
  }
}

/** Remove messages that aren't allowed media (system messages are kept). */
export function removeDisallowed(event: H3Event, roomId: string, messages: any[], kinds: SpaceMediaKind[]): void {
  for (const m of messages) {
    if (m.t || mediaOf(m, kinds)) continue
    deleteMessage(event, roomId, String(m._id)).catch((e) => {
      console.error('[space-media] could not remove a non-media message', e?.data?.error || e?.message)
    })
  }
}
