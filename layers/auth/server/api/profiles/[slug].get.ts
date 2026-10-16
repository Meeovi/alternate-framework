import { and, eq, isNull, or } from 'drizzle-orm'
import { createError, defineEventHandler, getRouterParam } from 'h3'
import { createDirectus, readItem, readItems, rest, staticToken } from '@directus/sdk'
import { db } from '../../utils/drizzle'
import { users } from '../../database/migrations/schema'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const PUBLISHED = ['published', 'Published', 'public', 'Public']

// Font Awesome icons for the Directus `profiles.links[].link_name` choices.
const LINK_ICONS: Record<string, string> = {
  facebook: 'fab fa-facebook',
  x: 'fab fa-x-twitter',
  twitter: 'fab fa-x-twitter',
  linkedin: 'fab fa-linkedin',
  twitch: 'fab fa-twitch',
  instagram: 'fab fa-instagram',
  youtube: 'fab fa-youtube',
  tiktok: 'fab fa-tiktok',
  github: 'fab fa-github',
}

/**
 * Rich-text fields come from Directus as HTML. The profile page renders them
 * as plain text (Vue-escaped), so strip the markup here rather than ship
 * user HTML to the client — none of the apps register a sanitizer.
 */
function toText(html: unknown): string {
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

/** Only http(s) links are rendered; a bare "example.com" gets https://. */
function safeUrl(raw: unknown): string | null {
  let value = typeof raw === 'string' ? raw.trim() : ''
  if (!value) return null
  if (!/^[a-z][a-z0-9+.-]*:/i.test(value)) value = `https://${value.replace(/^\/+/, '')}`
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null
  } catch {
    return null
  }
}

async function findUser(slug: string) {
  const columns = { id: users.id, name: users.name, username: users.username, image: users.image, createdAt: users.createdAt }
  const visible = and(isNull(users.deletedAt), or(isNull(users.authBanned), eq(users.authBanned, false)))
  const match = UUID.test(slug) ? eq(users.id, slug) : eq(users.username, slug.toLowerCase())
  const [user] = await db.select(columns).from(users).where(and(match, visible)).limit(1)
  return user
}

/**
 * GET /api/profiles/:slug — a member's public profile for /u/:slug.
 * `slug` is a user id, a username, or a Directus `profiles.slug`. Public
 * fields only (no email); notes and vibez are limited to published items.
 */
export default defineEventHandler(async (event) => {
  const slug = decodeURIComponent(String(getRouterParam(event, 'slug') ?? '')).replace(/^@/, '').trim()
  if (!slug) throw createError({ statusCode: 404, statusMessage: 'Profile not found' })

  const config = useRuntimeConfig()
  const directusUrl = (config.public as { directus?: { url?: string } }).directus?.url
  const token = (config as { directus?: { token?: string } }).directus?.token
  const directus = directusUrl && token
    ? createDirectus(directusUrl).with(rest()).with(staticToken(token))
    : null

  let user = await findUser(slug)

  // Fall back to a Directus profile slug (profiles.id is the app user id).
  if (!user && directus && !UUID.test(slug)) {
    const [row] = await directus
      .request(readItems('profiles', { fields: ['id'], filter: { slug: { _eq: slug } }, limit: 1 }))
      .catch(() => []) as Array<{ id: string }>
    if (row?.id) user = await findUser(row.id)
  }
  if (!user) throw createError({ statusCode: 404, statusMessage: 'Profile not found' })

  let profile: Record<string, any> | null = null
  let notes: Array<Record<string, any>> = []
  let vibez: Array<Record<string, any>> = []

  if (directus) {
    // Each source fails independently — an app whose Directus lacks a
    // collection (or whose token can't read it) just shows an empty tab.
    ;[profile, notes, vibez] = await Promise.all([
      directus.request(readItem('profiles', user.id, {
        fields: ['first_name', 'last_name', 'username', 'slug', 'description', 'position', 'company', 'links', 'avatar'],
      })).catch(() => null) as Promise<Record<string, any> | null>,
      directus.request(readItems('posts', {
        fields: ['id', 'slug', 'title', 'summary', 'content', 'image', 'image_url', 'date_created', 'date_published'],
        filter: {
          _and: [
            { creator_id: { _eq: user.id } },
            { status: { _in: PUBLISHED } },
            { _or: [{ visibility_scope: { _null: true } }, { visibility_scope: { _eq: 'public' } }] },
          ],
        },
        sort: ['-date_created'],
        limit: 24,
      })).catch(() => []) as Promise<Array<Record<string, any>>>,
      directus.request(readItems('shorts', {
        fields: ['id', 'name', 'description', 'type', 'video', 'video_url', 'thumbnail', 'thumbnail_url', 'date_created', 'views'],
        filter: { _and: [{ creator_id: { _eq: user.id } }, { status: { _in: PUBLISHED } }] },
        sort: ['-date_created'],
        limit: 24,
      })).catch(() => []) as Promise<Array<Record<string, any>>>,
    ])
  }

  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ')
  const links = (Array.isArray(profile?.links) ? profile.links : [])
    .map((link: Record<string, any>) => {
      const url = safeUrl(link?.link)
      if (!url) return null
      const label = typeof link?.link_name === 'string' ? link.link_name.trim() : ''
      return {
        title: label || new URL(url).hostname.replace(/^www\./, ''),
        url,
        description: typeof link?.description === 'string' ? link.description.trim() : '',
        icon: LINK_ICONS[label.toLowerCase()] || 'fas fa-link',
      }
    })
    .filter(Boolean)

  return {
    id: user.id,
    name: fullName || user.name,
    username: user.username || profile?.username || null,
    image: user.image || profile?.avatar || null,
    memberSince: user.createdAt,
    profession: profile?.position || null,
    company: profile?.company || null,
    description: toText(profile?.description),
    links,
    notes: notes.map(note => ({
      id: note.id,
      slug: note.slug,
      title: note.title || null,
      excerpt: toText(note.summary || note.content).slice(0, 280),
      image: note.image_url || note.image || null,
      date: note.date_published || note.date_created,
    })),
    vibez: vibez.map(vibe => ({
      id: vibe.id,
      name: vibe.name,
      description: toText(vibe.description).slice(0, 160),
      type: vibe.type || null,
      video: vibe.video || null,
      video_url: vibe.video_url || null,
      thumbnail: vibe.thumbnail || null,
      thumbnail_url: vibe.thumbnail_url || null,
      date: vibe.date_created,
      views: vibe.views ?? 0,
    })),
  }
})
