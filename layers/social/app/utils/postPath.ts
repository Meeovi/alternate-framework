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
 *  - a Fediverse note: /connect/note/@<user@instance>/<status id>;
 *  - a note from another network plugin (OStatus, Zot…):
 *    /connect/note/@<handle>/<network>:<key> — their handles look like
 *    Fediverse ones, so the network is named in the key.
 * Notes from other networks open here (Meeovi is their client); their
 * original address is only shown on the note's page, as its source.
 */
export function postPath(post?: NoteLike | null): string | null {
  if (post?.network === 'atproto' || post?.network === 'activitypub') {
    const handle = post.author?.handle
    const key = String(post.id ?? '').split('/').pop()
    return handle && key ? `/connect/note/@${encodeURIComponent(handle)}/${encodeURIComponent(key)}` : null
  }
  if (post?.network && post.network !== 'directus' && OTHER_NETWORK.test(post.network)) {
    const handle = post.author?.handle
    const key = String(post.id ?? '')
    return handle && key ? `/connect/note/@${encodeURIComponent(handle)}/${encodeURIComponent(`${post.network}:${key}`)}` : null
  }
  const key = post?.slug || post?.id
  return key === undefined || key === null || key === '' ? null : `/connect/note/${encodeURIComponent(String(key))}`
}

/**
 * The note a /connect/note/@<handle>/<key> address points at, or null for a
 * Meeovi note (/connect/note/<slug>). The handle says the network: a
 * Fediverse handle is user@instance, a Bluesky one has no @ (alice.bsky.social).
 */
export function federatedNoteRef(path: string): { network: string, author: string, key: string } | null {
  const match = /^@([^/]+)\/([^/]+)$/.exec(path)
  if (!match) return null
  const author = decodeURIComponent(match[1]!).replace(/^@/, '')
  const key = decodeURIComponent(match[2]!)
  if (!author || !key) return null
  // '<network>:<key>' — a note from another network plugin (OStatus, Zot…).
  const named = /^([a-z][a-z0-9_-]{1,31}):(.+)$/.exec(key)
  if (named && OTHER_NETWORK.test(named[1]!)) return { network: named[1]!, author, key: named[2]! }
  return { network: author.includes('@') ? 'activitypub' : 'atproto', author, key }
}

/** Network ids other than the built-in three that name themselves in note links. */
const OTHER_NETWORK = /^(?!atproto$|activitypub$|directus$)[a-z][a-z0-9_-]{1,31}$/

/** What to call a network's content to people. */
export const NETWORK_LABELS: Record<string, string> = { atproto: 'Bluesky', activitypub: 'the Fediverse', ostatus: 'GNU social', zot: 'Hubzilla' }

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

/**
 * The key a Bluesky or Fediverse note has on Meeovi, for its ratings
 * (content_ratings type `note`), its discussion (room `discussion-note-…`)
 * and its followers (follows target_type `note`). Meeovi's own notes keep
 * their post id (type `post`).
 *  - Bluesky: `atproto:<author DID>:<post key>` (the DID never changes; a
 *    handle can).
 *  - Fediverse: `activitypub:<instance>:<status id>`.
 * Only letters, digits and `_ . : -` (what ratings accept), at most 128.
 */
export function federatedNoteKey(post?: { network?: string, id?: string | number | null, author?: { id?: string, handle?: string } | null } | null): string | null {
  if (!post?.network || post.network === 'directus') return null
  if (post.network !== 'atproto' && post.network !== 'activitypub') {
    // Other network plugins (OStatus '<host>~<id>', Zot …): their ids already carry their server.
    const id = String(post.id ?? '')
    return id && OTHER_NETWORK.test(post.network) ? `${post.network}:${id}`.replace(/[^A-Za-z0-9_.:-]/g, '-').slice(0, 128) : null
  }
  // Feed items from server/utils/atproto-normalize.ts prefix it `atproto:`.
  const id = String(post.id ?? '').replace(/^atproto:(?=at:\/\/)/, '')
  let key: string | null = null
  if (post.network === 'atproto') {
    // at://<did>/app.bsky.feed.post/<rkey>
    const match = /^at:\/\/([^/]+)\/[^/]+\/([^/]+)$/.exec(id)
    if (match) key = `atproto:${match[1]}:${match[2]}`
  } else {
    const instance = String(post.author?.handle ?? '').split('@').pop()
    const status = id.split('/').pop()
    if (instance && status) key = `activitypub:${instance}:${status}`
  }
  return key ? key.replace(/[^A-Za-z0-9_.:-]/g, '-').slice(0, 128) : null
}

/** The type and id a note's rating, discussion and follow use. */
export function noteTarget(post?: Parameters<typeof federatedNoteKey>[0] & { id?: string | number | null }): { type: 'post' | 'note', id: string } | null {
  const key = federatedNoteKey(post)
  if (key) return { type: 'note', id: key }
  return post?.id !== undefined && post?.id !== null && post?.id !== '' ? { type: 'post', id: String(post.id) } : null
}
