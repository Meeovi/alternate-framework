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
 *    key being the last part of its at:// URI.
 */
export function postPath(post?: NoteLike | null): string | null {
  if (post?.network === 'atproto') {
    const handle = post.author?.handle
    const key = String(post.id ?? '').split('/').pop()
    return handle && key ? `/connect/note/@${encodeURIComponent(handle)}/${encodeURIComponent(key)}` : null
  }
  const key = post?.slug || post?.id
  return key === undefined || key === null || key === '' ? null : `/connect/note/${encodeURIComponent(String(key))}`
}

/** A Bluesky account's profile on Meeovi (/u/<handle>; a Meeovi member with that account shows as themselves). */
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
