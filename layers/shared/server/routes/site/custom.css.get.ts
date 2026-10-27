import { defineEventHandler, setResponseHeader } from 'h3'
import { sanitizeCustomCss } from '../../../shared/customCss'

/**
 * GET /site/custom.css — the CSS admins edit live in Directus
 * (globals.custom_css, Theming group), cleaned by sanitizeCustomCss().
 * Linked after the built stylesheets by app/plugins/custom-css.ts, so a
 * change shows within about a minute with no rebuild or restart.
 *
 * Read with the server's Directus token and kept in memory for 30 s; if
 * Directus is unreachable the last good copy keeps being served, so a CMS
 * outage never strips the site's styling changes.
 */
const TTL_MS = 30_000
let cached: { at: number, body: string } | null = null

async function load(): Promise<string> {
  const config = useRuntimeConfig()
  const url = (config.public as { directus?: { url?: string } }).directus?.url
  const token = (config as { directus?: { token?: string } }).directus?.token
  if (!url) return ''
  const res = await $fetch<{ data?: { custom_css?: string | null } }>(`${url.replace(/\/+$/, '')}/items/globals`, {
    query: { fields: 'custom_css' },
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    timeout: 5000,
  })
  const { css, refused } = sanitizeCustomCss(res?.data?.custom_css)
  return refused ? `/* Custom CSS not applied: it ${refused}. Fix it in Directus → Globals → Theming. */\n` : css
}

export default defineEventHandler(async (event) => {
  if (!cached || Date.now() - cached.at > TTL_MS) {
    try {
      cached = { at: Date.now(), body: await load() }
    } catch {
      // Keep the last good copy (or nothing) and try again on a later request.
      cached = { at: Date.now() - TTL_MS + 5000, body: cached?.body ?? '' }
    }
  }
  setResponseHeader(event, 'Content-Type', 'text/css; charset=utf-8')
  // Short, shared caching: Cloudflare and browsers recheck within a minute.
  setResponseHeader(event, 'Cache-Control', 'public, max-age=60')
  setResponseHeader(event, 'X-Content-Type-Options', 'nosniff')
  return cached.body
})
