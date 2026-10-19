/**
 * Link to a post's page, /connect/note/<slug>, falling back to the post's
 * id: posts made from the composer before 19 October 2026 (or straight in
 * Directus) can have no slug, and the note page accepts either.
 */
export function postPath(post?: { slug?: string | null, id?: string | number | null } | null): string | null {
  const key = post?.slug || post?.id
  return key === undefined || key === null || key === '' ? null : `/connect/note/${encodeURIComponent(String(key))}`
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
