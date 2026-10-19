// The "directus" federation network: this site's own members and posts,
// stored in Directus (posts, follows) and better-auth (users), on the same
// contract as the AT Protocol and ActivityPub plugins. It is the fallback
// the federation always has: it works with no network credentials at all,
// and /api/social/federation/search merges it with whatever else answers.
//
// Shows exactly what a public profile page shows (auth layer's
// /api/profiles/:slug): visible users only, and posts that are published
// and public.
import type { FederatedActor, FederatedPost, FederationNetwork, FederationStatus } from '../../shared/types/federation'

export const DIRECTUS_NETWORK = 'directus'

const PUBLISHED = ['published', 'Published', 'public', 'Public']
const PUBLIC_POSTS = [
  { status: { _in: PUBLISHED } },
  { _or: [{ visibility_scope: { _null: true } }, { visibility_scope: { _eq: 'public' } }] },
]
const POST_FIELDS = ['id', 'slug', 'title', 'summary', 'content', 'image', 'image_url', 'date_created', 'date_published', 'creator_id', 'username', 'user_avatar']

/** A visible (not deleted, not banned) member. */
export type MemberRow = { id: string, name: string | null, username: string | null, image: string | null }

type PostRow = Record<string, any>
type Query = Record<string, unknown>

export type DirectusNetworkDeps = {
  /** Directus base URL (status and asset links). */
  service: string
  /** Site origin for profile and post links; links are omitted without it. */
  siteUrl?: string
  readItems: (collection: string, query: Query) => Promise<PostRow[]>
  ping: () => Promise<void>
  /** By user id or username. */
  findMember: (idOrUsername: string) => Promise<MemberRow | null>
  findMembers: (ids: string[]) => Promise<MemberRow[]>
}

/** Rich text from Directus as plain text (the contract's `text`). */
export function toPlainText(html: unknown): string {
  if (typeof html !== 'string' || !html) return ''
  return html
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, '')
    .replace(/<\s*(br|\/p|\/div|\/li|\/h[1-6])\s*\/?>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function createDirectusNetwork(deps: DirectusNetworkDeps): FederationNetwork {
  const site = deps.siteUrl?.replace(/\/+$/, '') || ''
  const assets = deps.service.replace(/\/+$/, '')

  const toActor = (member: MemberRow, counts?: { followers: number, following: number, posts: number }): FederatedActor => ({
    id: member.id,
    network: DIRECTUS_NETWORK,
    handle: member.username || member.id,
    displayName: member.name || member.username || undefined,
    avatar: member.image || undefined,
    url: site ? `${site}/u/${encodeURIComponent(member.username || member.id)}` : undefined,
    ...counts,
  })

  // Posts written before creator_id existed only carry a username/avatar.
  const authorOf = (post: PostRow, members: Map<string, MemberRow>): FederatedActor => {
    const member = post.creator_id ? members.get(post.creator_id) : undefined
    if (member) return toActor(member)
    return { id: String(post.creator_id || post.username || 'unknown'), network: DIRECTUS_NETWORK, handle: post.username || 'member', displayName: post.username || undefined, avatar: post.user_avatar || undefined }
  }

  const toPost = (post: PostRow, members: Map<string, MemberRow>): FederatedPost => {
    const image = post.image_url || (post.image ? `${assets}/assets/${post.image}` : null)
    const text = toPlainText(post.content) || toPlainText(post.summary) || String(post.title ?? '')
    return {
      id: String(post.id),
      network: DIRECTUS_NETWORK,
      url: site && (post.slug || post.id) ? `${site}/connect/note/${encodeURIComponent(String(post.slug || post.id))}` : undefined,
      text,
      createdAt: new Date(post.date_published || post.date_created || 0).toISOString(),
      author: authorOf(post, members),
      media: image ? [{ url: image, type: 'image' as const }] : undefined,
      hashtags: [...new Set(text.match(/#[\p{L}\p{N}_]+/gu)?.map((tag) => tag.slice(1).toLowerCase()) ?? [])],
    }
  }

  /** Posts with their authors, dropping posts whose creator isn't visible. */
  const withAuthors = async (rows: PostRow[]): Promise<FederatedPost[]> => {
    const ids = [...new Set(rows.map((row) => row.creator_id).filter(Boolean))] as string[]
    const members = new Map((ids.length ? await deps.findMembers(ids) : []).map((m) => [m.id, m]))
    return rows
      .filter((row) => !row.creator_id || members.has(row.creator_id))
      .map((row) => toPost(row, members))
  }

  const member = (handle: string) => {
    const clean = handle.replace(/^@/, '').trim()
    return clean ? deps.findMember(clean) : Promise.resolve(null)
  }

  const count = async (collection: string, filter: Query): Promise<number> => {
    const [row] = await deps.readItems(collection, { aggregate: { count: 'id' }, filter }).catch(() => [])
    return Number(row?.count?.id ?? row?.count ?? 0) || 0
  }

  return {
    id: DIRECTUS_NETWORK,
    label: 'Meeovi',

    async status(): Promise<FederationStatus> {
      if (!deps.service) return { configured: false, connected: false, service: '' }
      try {
        await deps.ping()
        return { configured: true, connected: true, service: deps.service }
      } catch (error) {
        return { configured: true, connected: false, service: deps.service, detail: (error as Error)?.message || 'unavailable' }
      }
    },

    async profile(handle) {
      const found = await member(handle)
      if (!found) return null
      const [followers, following, posts] = await Promise.all([
        count('follows', { _and: [{ target_type: { _eq: 'user' } }, { target_id: { _eq: found.id } }] }),
        count('follows', { follower_id: { _eq: found.id } }),
        count('posts', { _and: [{ creator_id: { _eq: found.id } }, ...PUBLIC_POSTS] }),
      ])
      return toActor(found, { followers, following, posts })
    },

    async feed(actor, options = {}) {
      const found = await member(actor)
      if (!found) return []
      const rows = await deps.readItems('posts', {
        fields: POST_FIELDS,
        filter: { _and: [{ creator_id: { _eq: found.id } }, ...PUBLIC_POSTS] },
        sort: ['-date_created'],
        limit: options.limit ?? 20,
      })
      return rows.map((row) => toPost(row, new Map([[found.id, found]])))
    },

    async searchPosts(query, options = {}) {
      const q = query.trim()
      if (!q) return []
      const rows = await deps.readItems('posts', {
        fields: POST_FIELDS,
        filter: {
          _and: [
            ...PUBLIC_POSTS,
            { _or: [{ content: { _icontains: q } }, { title: { _icontains: q } }, { summary: { _icontains: q } }] },
          ],
        },
        sort: ['-date_created'],
        limit: options.limit ?? 20,
      })
      return withAuthors(rows)
    },
  }
}
