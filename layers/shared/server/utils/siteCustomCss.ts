import { createHash } from 'node:crypto'
import { sanitizeCustomCss } from '../../shared/customCss'

/**
 * The live site CSS (Directus globals.custom_css), cleaned by
 * sanitizeCustomCss(), with a short version taken from its content.
 * Served by routes/site/custom.css.get.ts; pages link it as
 * /site/custom.css?v=<version> (app/plugins/custom-css.ts), so a change gets
 * a new URL that no browser or Cloudflare cache has seen.
 *
 * Read with the server's Directus token and kept in memory for 10 s; if
 * Directus is unreachable the last good copy keeps being served, so a CMS
 * outage never strips the site's styling changes.
 */
const TTL_MS = 10_000
let cached: { at: number, body: string, version: string } | null = null

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

const versionOf = (body: string) => createHash('sha256').update(body).digest('hex').slice(0, 12)

export async function siteCustomCss(): Promise<{ body: string, version: string }> {
  if (!cached || Date.now() - cached.at > TTL_MS) {
    try {
      const body = await load()
      cached = { at: Date.now(), body, version: versionOf(body) }
    } catch {
      // Keep the last good copy (or nothing) and try again in a few seconds.
      const body = cached?.body ?? ''
      cached = { at: Date.now() - TTL_MS + 5000, body, version: versionOf(body) }
    }
  }
  return cached
}
