type NoteLike = {
  slug?: string | null
  id?: string | number | null
  network?: string
  author?: { handle?: string } | null
}

/**
 * Link to a note's page on Meeovi:
 *  - a Meeovi note: /connect/note/<slug>, falling back to its id (notes made
 *    from the composer before 19 October 2026, or straight in Directus, can
 *    have no slug, and the note page accepts either);
 *  - a Bluesky note (from the federation API): /connect/note/@<handle>/<key>,
 *    key being the last part of its at:// URI;
 *  - a Fediverse note: /connect/note/@<user@instance>/<status id>.
 * Notes from other networks open here (Meeovi is their client); their
 * original address is only shown on the note's page, as its source.
 */
export function postPath(post?: NoteLike | null): string | null {
  if (post?.network === 'atproto' || post?.network === 'activitypub') {
    const handle = post.author?.handle
    const key = String(post.id ?? '').split('/').pop()
    return handle && key ? `/connect/note/@${encodeURIComponent(handle)}/${encodeURIComponent(key)}` : null
  }
  const key = post?.slug || post?.id
  return key === undefined || key === null || key === '' ? null : `/connect/note/${encodeURIComponent(String(key))}`
}

/**
 * The note a /connect/note/@<handle>/<key> address points at, or null for a
 * Meeovi note (/connect/note/<slug>). The handle says the network: a
 * Fediverse handle is user@instance, a Bluesky one has no @ (alice.bsky.social).
 */
export function federatedNoteRef(path: string): { network: 'atproto' | 'activitypub', author: string, key: string } | null {
  const match = /^@([^/]+)\/([^/]+)$/.exec(path)
  if (!match) return null
  const author = decodeURIComponent(match[1]!).replace(/^@/, '')
  const key = decodeURIComponent(match[2]!)
  if (!author || !key) return null
  return { network: author.includes('@') ? 'activitypub' : 'atproto', author, key }
}

/** What to call a network's content to people. */
export const NETWORK_LABELS: Record<string, string> = { atproto: 'Bluesky', activitypub: 'the Fediverse' }

/** An account's profile on Meeovi (Bluesky or Fediverse) (/u/<handle>; a Meeovi member with that account shows as themselves). */
export function federatedProfilePath(author?: { handle?: string } | null): string | null {
  return author?.handle ? `/u/${encodeURIComponent(author.handle)}` : null
}

/**
 * A slug for a new post: its first words (title, or else the text with any
 * HTML stripped), plus a random suffix so posts with the same opening don't
 * collide.
 */
export function newPostSlug(text?: string | null): string {
  const words = String(text ?? '')
    .replace(/<[^>]*>/g, ' ')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
    .slice(0, 8)
    .join('-')
    .slice(0, 60)
    .replace(/-+$/, '')
  const suffix = Math.random().toString(36).slice(2, 8)
  return words ? `${words}-${suffix}` : `post-${suffix}`
}
