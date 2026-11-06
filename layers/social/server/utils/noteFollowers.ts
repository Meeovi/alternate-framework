import { createDirectus, readItems, rest, staticToken } from '@directus/sdk'
import { triggerNovuWorkflow } from '#shared/server/utils/novu'

/**
 * A new comment in a note's discussion tells the note's followers (follows
 * target_type `note`), through the same "new-content" notification as new
 * posts. Called by the Rocket.Chat message webhook
 * (api/social/discussions/moderate.post.ts) for messages that aren't spam.
 *
 * Rooms are `discussion-post-<post id>` (a Meeovi note) and
 * `discussion-note-<key>` (a Bluesky/Fediverse note, key from
 * federatedNoteKey in app/utils/postPath.ts), lowercased with anything but
 * `a-z 0-9 _ . -` turned into `-`. A note's follow row keeps the real id,
 * so rows are matched by cleaning their id the same way.
 */

const directus = createDirectus(process.env.DIRECTUS_URL!)
  .with(rest())
  .with(staticToken(process.env.NUXTUS_DIRECTUS_STATIC_TOKEN!))

const clean = (id: string) => String(id).toLowerCase().replace(/[^a-z0-9_.-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 100)

// At most one notification per note per 10 minutes, so a busy conversation
// doesn't send one per message.
const QUIET_MS = 10 * 60 * 1000
const lastSent = new Map<string, number>()

/** Where a notification about this note goes. */
function noteUrl(type: string, id: string): string {
  if (type === 'post') return `/connect/note/${encodeURIComponent(id)}`
  // atproto:<did>:<post key> — Bluesky looks the author up by DID too.
  const atproto = /^atproto:(did:[a-z0-9]+:[^:]+):(.+)$/i.exec(id)
  if (atproto) return `/connect/note/@${encodeURIComponent(atproto[1]!)}/${encodeURIComponent(atproto[2]!)}`
  return '/connect/notes'
}

export async function notifyNoteFollowers(roomName: string | undefined, authorRcUsername: string | undefined): Promise<void> {
  const match = /^discussion-(post|note)-(.+)$/.exec(String(roomName ?? ''))
  if (!match) return
  const [, type, suffix] = match as unknown as [string, 'post' | 'note', string]
  const now = Date.now()
  if (now - (lastSent.get(roomName!) ?? 0) < QUIET_MS) return
  // The room name lost the id's case and punctuation: find candidate rows by
  // its last part (a post id, Bluesky post key or status id), then compare.
  const tail = suffix.split('-').pop() || suffix
  const rows = await directus.request(readItems('follows', {
    filter: { target_type: { _eq: 'note' }, target_id: { _contains: tail } },
    fields: ['follower_id', 'target_id'],
    limit: -1,
  })).catch(() => []) as Array<{ follower_id: string, target_id: string }>
  const matching = rows.filter((row) => clean(row.target_id) === suffix)
  // The commenter's own Rocket.Chat user is meeovi-<their id>.
  const authorId = String(authorRcUsername ?? '').replace(/^meeovi-/, '')
  const to = [...new Set(matching.map((row) => row.follower_id))].filter((id) => id && id !== authorId)
  if (!to.length) return
  lastSent.set(roomName!, now)
  if (lastSent.size > 5000) for (const [room, at] of lastSent) if (now - at > QUIET_MS) lastSent.delete(room)
  await triggerNovuWorkflow('new-content', {
    to,
    payload: {
      subject: 'New comment',
      actorId: authorId || null,
      actorName: 'Someone',
      contentType: 'comment',
      itemId: matching[0]!.target_id,
      label: 'a new comment on a note you follow',
      url: noteUrl(type, matching[0]!.target_id),
    },
  })
}
