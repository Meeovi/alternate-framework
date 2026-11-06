import { createDirectus, readItems, rest, staticToken } from '@directus/sdk'
import { defineEventHandler } from 'h3'
import { requireAuth } from '#auth/server/utils/sessions'

/**
 * GET /api/social/spaces/mine — the signed-in member's spaces, for the
 * "My Spaces" card on their profile:
 *  - `created`: spaces they own (spaces.owner, a Directus user matched by
 *    their verified email). Needs the app token to read directus_users,
 *    which it can't today, so this is empty until it can;
 *  - `joined`: spaces they joined with the Join button (a follows row,
 *    target_type `space`) or are listed in as a member (spaces.members).
 * The same rules as space access (server/utils/spaceMedia.ts).
 */

const directus = createDirectus(process.env.DIRECTUS_URL!)
  .with(rest())
  .with(staticToken(process.env.NUXTUS_DIRECTUS_STATIC_TOKEN!))

const FIELDS = ['id', 'name', 'slug', 'description', 'image', 'image_url', 'date_created', 'status', 'owner.email']

type Space = Record<string, any>

const warned = new Set<string>()

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event) as Record<string, any>
  const email = user.emailVerified && user.email ? String(user.email).toLowerCase() : null

  const followed = await directus.request(readItems('follows', {
    filter: { follower_id: { _eq: String(user.id) }, target_type: { _eq: 'space' } },
    fields: ['target_id'],
    limit: -1,
  })).catch(() => []) as Array<{ target_id: string }>
  const joinedIds = [...new Set(followed.map((row) => String(row.target_id)).filter((id) => /^\d{1,12}$/.test(id)))]

  // One query per way of belonging: a part the token can't read (the
  // owner / member links go through directus_users) only loses that part.
  const query = (filter: Record<string, unknown>, fields = FIELDS) => directus.request(readItems('spaces', {
    filter,
    fields: fields as any,
    sort: ['-date_created'],
    limit: 200,
  })).catch((error: any) => {
    // The app token can't read directus_users today, so the owner / member
    // lookups are refused: say so once, not on every profile view.
    const message = String(error?.errors?.[0]?.message || error?.message || error)
    if (!warned.has(message)) {
      warned.add(message)
      console.warn('[spaces/mine]', message)
    }
    return []
  }) as Promise<Space[]>
  const plain = FIELDS.filter((field) => field !== 'owner.email')
  const [joinedRows, ownedRows, memberRows] = await Promise.all([
    joinedIds.length ? query({ id: { _in: joinedIds } }, plain) : [],
    email ? query({ owner: { email: { _eq: email } } }) : [],
    email ? query({ members: { directus_users_id: { email: { _eq: email } } } }, plain) : [],
  ])

  const owned = new Set(ownedRows.map((space) => String(space.id)))
  const seen = new Set<string>()
  const rows = [...ownedRows, ...memberRows, ...joinedRows].filter((space) => {
    const id = String(space.id)
    if (seen.has(id)) return false
    seen.add(id)
    return true
  })

  const owns = (space: Space) => owned.has(String(space.id))
  // No owner emails in the answer.
  const clean = ({ owner: _owner, ...space }: Space) => space
  return {
    created: rows.filter(owns).map(clean),
    joined: rows.filter((space) => !owns(space)).map(clean),
  }
})
