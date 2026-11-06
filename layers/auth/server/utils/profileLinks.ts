import { readItem } from '@directus/sdk'

/**
 * A member's "Connect with Me" links (Directus `profiles.links`, a JSON
 * list of { link_name, link, description, icon }), shown like a Linktree on
 * their profile's Connect with Me tab. Read by GET /api/profiles/:slug and
 * saved by PUT /api/profiles/me/links.
 */

export const MAX_PROFILE_LINKS = 30

/** Only http(s) links are kept; a bare "example.com" gets https://. */
export function safeUrl(raw: unknown): string | null {
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

// Font Awesome icons by link name (the Directus choices, and what people type)…
const NAME_ICONS: Record<string, string> = {
  facebook: 'fab fa-facebook',
  x: 'fab fa-x-twitter',
  twitter: 'fab fa-x-twitter',
  linkedin: 'fab fa-linkedin',
  twitch: 'fab fa-twitch',
  instagram: 'fab fa-instagram',
  youtube: 'fab fa-youtube',
  tiktok: 'fab fa-tiktok',
  github: 'fab fa-github',
  bluesky: 'fab fa-bluesky',
  mastodon: 'fab fa-mastodon',
  threads: 'fab fa-threads',
  pinterest: 'fab fa-pinterest',
  spotify: 'fab fa-spotify',
  soundcloud: 'fab fa-soundcloud',
  discord: 'fab fa-discord',
  reddit: 'fab fa-reddit',
  snapchat: 'fab fa-snapchat',
  patreon: 'fab fa-patreon',
  etsy: 'fab fa-etsy',
  website: 'fas fa-globe',
}

// …or by the link's site, when the name doesn't say.
const HOST_ICONS: Array<[RegExp, string]> = [
  [/(^|\.)facebook\.com$|(^|\.)fb\.com$/, 'fab fa-facebook'],
  [/(^|\.)(x|twitter)\.com$/, 'fab fa-x-twitter'],
  [/(^|\.)linkedin\.com$/, 'fab fa-linkedin'],
  [/(^|\.)twitch\.tv$/, 'fab fa-twitch'],
  [/(^|\.)instagram\.com$/, 'fab fa-instagram'],
  [/(^|\.)(youtube\.com|youtu\.be)$/, 'fab fa-youtube'],
  [/(^|\.)tiktok\.com$/, 'fab fa-tiktok'],
  [/(^|\.)github\.com$/, 'fab fa-github'],
  [/(^|\.)bsky\.(app|social)$/, 'fab fa-bluesky'],
  [/(^|\.)threads\.net$/, 'fab fa-threads'],
  [/(^|\.)pinterest\.[a-z.]+$/, 'fab fa-pinterest'],
  [/(^|\.)spotify\.com$/, 'fab fa-spotify'],
  [/(^|\.)soundcloud\.com$/, 'fab fa-soundcloud'],
  [/(^|\.)(discord\.gg|discord\.com)$/, 'fab fa-discord'],
  [/(^|\.)reddit\.com$/, 'fab fa-reddit'],
  [/(^|\.)snapchat\.com$/, 'fab fa-snapchat'],
  [/(^|\.)patreon\.com$/, 'fab fa-patreon'],
  [/(^|\.)etsy\.com$/, 'fab fa-etsy'],
  [/(^|\.)(mastodon\.social|mastodon\.online|mstdn\.social)$/, 'fab fa-mastodon'],
]

export function linkIcon(label: string, url: string): string {
  const byName = NAME_ICONS[label.trim().toLowerCase()]
  if (byName && byName !== 'fas fa-globe') return byName
  let host = ''
  try { host = new URL(url).hostname.toLowerCase() } catch { /* not a URL */ }
  return HOST_ICONS.find(([test]) => test.test(host))?.[1] || byName || 'fas fa-link'
}

export type ProfileLink = { label: string, title: string, url: string, description: string, icon: string }

/** Stored links → what the profile page shows (bad URLs dropped). */
export function toProfileLinks(raw: unknown): ProfileLink[] {
  return (Array.isArray(raw) ? raw : [])
    .map((link: Record<string, any>) => {
      const url = safeUrl(link?.link)
      if (!url) return null
      const label = typeof link?.link_name === 'string' ? link.link_name.trim() : ''
      return {
        // As typed, for the owner's editor; `title` is what everyone sees.
        label,
        title: label || new URL(url).hostname.replace(/^www\./, ''),
        url,
        description: typeof link?.description === 'string' ? link.description.trim() : '',
        icon: linkIcon(label, url),
      }
    })
    .filter((link): link is ProfileLink => !!link)
}

/**
 * The Directus profile row of an app user: its id is the user's id
 * (`profiles.user` points at a Directus user, not an app user).
 */
export async function findProfileRow<T extends Record<string, any>>(directus: any, userId: string, fields: string[]): Promise<T | null> {
  return await directus.request(readItem('profiles', userId, { fields })).catch(() => null) as T | null
}
