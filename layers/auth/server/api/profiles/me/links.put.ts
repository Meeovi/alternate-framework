import { createError, defineEventHandler, readBody } from 'h3'
import { createDirectus, createItem, rest, staticToken, updateItem } from '@directus/sdk'
import { requireAuth } from '../../../utils/sessions'
import { MAX_PROFILE_LINKS, findProfileRow, linkIcon, safeUrl, toProfileLinks } from '../../../utils/profileLinks'

/**
 * PUT /api/profiles/me/links — save the signed-in member's "Connect with
 * Me" links (their profile's Linktree-style tab), in the order given.
 * Body: { links: [{ title, url, description? }] }. Replaces the whole list.
 * Only the member's own Directus profile row is written; one is made for
 * them if they have none yet.
 */
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody<{ links?: unknown }>(event).catch(() => null)
  if (!Array.isArray(body?.links)) throw createError({ statusCode: 400, statusMessage: 'links must be a list' })
  if (body.links.length > MAX_PROFILE_LINKS) {
    throw createError({ statusCode: 400, statusMessage: `At most ${MAX_PROFILE_LINKS} links` })
  }

  const text = (value: unknown, max: number) => (typeof value === 'string' ? value.trim().slice(0, max) : '')
  const links = body.links.map((raw, index) => {
    const item = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
    const url = text(item.url, 2048)
    const safe = safeUrl(url)
    if (!safe) throw createError({ statusCode: 400, statusMessage: `Link ${index + 1}: enter a web address (https://…)` })
    const title = text(item.title, 80)
    return { link_name: title || null, link: safe, description: text(item.description, 200) || null, icon: linkIcon(title, safe) }
  })

  const config = useRuntimeConfig()
  const directusUrl = (config.public as { directus?: { url?: string } }).directus?.url
  const token = (config as { directus?: { token?: string } }).directus?.token
  if (!directusUrl || !token) throw createError({ statusCode: 503, statusMessage: 'Profiles are unavailable' })
  const directus = createDirectus(directusUrl).with(rest()).with(staticToken(token))

  const row = await findProfileRow<{ id: string }>(directus, user.id, ['id'])
  try {
    if (row?.id) {
      await directus.request(updateItem('profiles', row.id, { links }))
    } else {
      await directus.request(createItem('profiles', {
        id: user.id,
        username: (user as { username?: string | null }).username || null,
        links,
      }))
    }
  } catch (error) {
    console.error('[profiles] saving links failed', user.id, (error as Error)?.message || error)
    throw createError({ statusCode: 502, statusMessage: "Your links couldn't be saved. Please try again." })
  }
  return { links: toProfileLinks(links) }
})
