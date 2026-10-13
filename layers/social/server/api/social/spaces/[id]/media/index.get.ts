import { defineEventHandler, getQuery, getRouterParam } from 'h3'
import {
  removeDisallowed,
  revokeSpaceMedia,
  SPACE_MEDIA_LIMITS,
  spaceMediaAccess,
  spaceRoom,
  toSpaceMediaMessage,
  type SpaceMediaMessage,
} from '../../../../../utils/spaceMedia'

const PAGE = 30

/**
 * GET /api/social/spaces/:id/media?before=<iso> — the space's audio/video
 * discussion, newest first. Non-members get `{ member: false }` (no messages)
 * so the page can invite them to join.
 */
export default defineEventHandler(async (event) => {
  const access = await spaceMediaAccess(event, String(getRouterParam(event, 'id') ?? ''))
  const base = {
    member: access.member,
    admin: access.admin,
    kinds: access.space.kinds,
    limits: Object.fromEntries(access.space.kinds.map((k) => [k, SPACE_MEDIA_LIMITS[k]])),
  }
  if (!access.member) {
    // Lost membership some other way (e.g. removed in Directus)? Leave the room too.
    void revokeSpaceMedia(event, access.space.id, access)
    return { ...base, messages: [] as SpaceMediaMessage[], hasMore: false }
  }

  const before = String(getQuery(event).before ?? '')
  const { group, me } = await spaceRoom(event, access)
  const res = await me.call<{ messages: any[] }>('groups.history', {
    query: { roomId: group._id, count: PAGE, ...(/^\d{4}-\d{2}-\d{2}T/.test(before) ? { latest: before } : {}) },
  })
  const raw = res.messages ?? []
  removeDisallowed(event, group._id, raw, access.space.kinds)
  return {
    ...base,
    messages: raw.map((m) => toSpaceMediaMessage(m, access, me.url)).filter(Boolean) as SpaceMediaMessage[],
    hasMore: raw.length === PAGE,
    // Paging cursor: the oldest message fetched, media or not.
    before: raw.length ? String(raw[raw.length - 1].ts) : null,
  }
})
