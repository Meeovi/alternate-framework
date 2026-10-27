import { createError, getRequestHeader } from 'h3'
import type { H3Event } from 'h3'
import type { GalleryEntry, GalleryMediaItem, GalleryMediaKind } from '../../types'

/**
 * A user's gallery is their own folder on Pixanomy (Nextcloud,
 * app.pixanomy.com): `<root>/<user id>/<category>/<yyyy-mm>/<uuid>-<name>`,
 * which is exactly where the app's /api/assets/upload writes
 * (layers/shared/server/utils/pixanomy.ts). Everything is read as the one
 * service account, scoped to `<root>/<user id>` — the id always comes from
 * the session, so a request can only ever list its own files.
 *
 * Every upload already has a read-only public link (that's what the rest of
 * Meeovi stores and renders); the gallery reuses those links, fetched for the
 * whole folder in one OCS call instead of one call per file.
 */

type PixanomyConfig = { url: string, username: string, appPassword: string, root: string }
type Config = { sessionEndpoint: string, pixanomy: PixanomyConfig }

const clean = (value: unknown) => String(value ?? '').trim().replace(/^(['"])(.*)\1$/, '$2')

export function galleryConfig(event?: H3Event): Config {
  const config = useRuntimeConfig(event) as Record<string, any>
  const own = config.meeoviGallery ?? {}
  // The app's own Pixanomy settings (NUXT_PIXANOMY_*) are the default, so
  // the gallery always reads the folders /api/assets/upload writes to.
  const app = config.pixanomy ?? {}
  const pick = (key: string) => clean(own.pixanomy?.[key]) || clean(app[key])
  return {
    sessionEndpoint: own.sessionEndpoint || '/api/auth/get-session',
    pixanomy: {
      url: pick('url').replace(/\/+$/, ''),
      username: pick('username'),
      appPassword: pick('appPassword'),
      root: (pick('root') || 'Meeovi').replace(/^\/+|\/+$/g, ''),
    },
  }
}

export function isGalleryConfigured(cfg: PixanomyConfig): boolean {
  return Boolean(cfg.url && cfg.username && cfg.appPassword)
}

export async function requireUser(event: H3Event): Promise<{ id: string }> {
  const cookie = getRequestHeader(event, 'cookie')
  if (cookie) {
    try {
      const session = await $fetch<{ user?: { id?: string } } | null>(galleryConfig(event).sessionEndpoint, { headers: { cookie } })
      if (session?.user?.id) return { id: String(session.user.id) }
    } catch { /* treated as signed out */ }
  }
  throw createError({ statusCode: 401, statusMessage: 'Sign in to see your media' })
}

// Same rule as layers/shared/server/utils/pixanomy.ts sanitizeSegment(), so
// the owner folder name matches the one uploads were written to.
export function sanitizeSegment(value: string, fallback = 'file'): string {
  const cleaned = value
    .normalize('NFKD')
    .replace(/[^\w.-]+/g, '-')
    .replace(/^[.-]+|[.-]+$/g, '')
    .replace(/-{2,}/g, '-')
    .slice(0, 100)
  return cleaned || fallback
}

export function kindOf(contentType: string): GalleryMediaKind {
  const type = contentType.toLowerCase()
  if (type.startsWith('image/')) return 'image'
  if (type.startsWith('video/')) return 'video'
  if (type.startsWith('audio/')) return 'audio'
  return 'other'
}

// ---------------------------------------------------------------------------
// Pixanomy reads

export interface StoredFile {
  /** Path inside the owner folder, e.g. "posts/2026-10/<uuid>-beach.jpg". */
  path: string
  contentType: string
  size: number
  modified: string | null
}

const authHeader = (cfg: PixanomyConfig) =>
  'Basic ' + Buffer.from(`${cfg.username}:${cfg.appPassword}`).toString('base64')

const ownerSegments = (cfg: PixanomyConfig, ownerId: string) =>
  [...cfg.root.split('/').filter(Boolean), sanitizeSegment(ownerId, 'anonymous')]

function xmlDecode(value: string) {
  return value
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'").replace(/&amp;/g, '&')
}

function xmlTag(block: string, tag: string) {
  const m = new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`).exec(block)
  return m ? xmlDecode(m[1]!) : null
}

/**
 * Every file in the owner's folder (any type), newest first, via one WebDAV
 * SEARCH scoped to `<root>/<ownerId>`. `types` narrows by MIME prefix.
 */
export async function listOwnerFiles(
  cfg: PixanomyConfig,
  ownerId: string,
  { limit = 1000, types = [] as string[] } = {},
): Promise<StoredFile[]> {
  const owner = ownerSegments(cfg, ownerId)
  const scope = ['files', cfg.username, ...owner].map((s) => encodeURIComponent(s)).join('/')
  const typeFilter = types
    .map((t) => `<d:like><d:prop><d:getcontenttype/></d:prop><d:literal>${t.replace(/[<&%]/g, '')}%</d:literal></d:like>`)
    .join('')
  const where = types.length
    ? (types.length > 1 ? `<d:or>${typeFilter}</d:or>` : typeFilter)
    // Folders are the only entries Nextcloud types httpd/unix-directory.
    : '<d:not><d:eq><d:prop><d:getcontenttype/></d:prop><d:literal>httpd/unix-directory</d:literal></d:eq></d:not>'

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<d:searchrequest xmlns:d="DAV:" xmlns:oc="http://owncloud.org/ns">
  <d:basicsearch>
    <d:select><d:prop><d:getcontenttype/><d:getlastmodified/><d:getcontentlength/></d:prop></d:select>
    <d:from><d:scope><d:href>/${scope}</d:href><d:depth>infinity</d:depth></d:scope></d:from>
    <d:where>${where}</d:where>
    <d:orderby><d:order><d:prop><d:getlastmodified/></d:prop><d:descending/></d:order></d:orderby>
    <d:limit><d:nresults>${Math.max(1, Math.min(5000, Math.floor(limit)))}</d:nresults></d:limit>
  </d:basicsearch>
</d:searchrequest>`

  const res = await fetch(`${cfg.url}/remote.php/dav/`, {
    method: 'SEARCH',
    headers: { Authorization: authHeader(cfg), 'Content-Type': 'text/xml; charset=utf-8' },
    body,
  })
  // No folder yet = nothing uploaded yet.
  if (res.status === 404) return []
  if (!res.ok) throw createError({ statusCode: 502, statusMessage: `Media storage search failed (${res.status})` })

  const ownerPrefix = `/remote.php/dav/files/${encodeURIComponent(cfg.username)}/${owner.map(encodeURIComponent).join('/')}/`
  const xml = await res.text()
  return [...xml.matchAll(/<d:response>([\s\S]*?)<\/d:response>/g)]
    .map(([, block]) => {
      const href = xmlTag(block!, 'd:href') || ''
      const contentType = xmlTag(block!, 'd:getcontenttype') || ''
      const at = href.indexOf(ownerPrefix)
      if (!contentType || href.endsWith('/') || at < 0) return null
      return {
        path: decodeURIComponent(href.slice(at + ownerPrefix.length)),
        contentType,
        size: Number(xmlTag(block!, 'd:getcontentlength') || 0),
        modified: xmlTag(block!, 'd:getlastmodified'),
      }
    })
    .filter((f): f is StoredFile => Boolean(f))
}

/**
 * Public links of the files in the owner's folder: path inside the owner
 * folder → share URL. One OCS call for all of the service account's shares,
 * kept to this owner's prefix.
 */
export async function ownerShareLinks(cfg: PixanomyConfig, ownerId: string): Promise<Map<string, string>> {
  const res = await fetch(`${cfg.url}/ocs/v2.php/apps/files_sharing/api/v1/shares?format=json`, {
    headers: { Authorization: authHeader(cfg), 'OCS-APIRequest': 'true', Accept: 'application/json' },
  })
  const json: any = await res.json().catch(() => null)
  if (!res.ok || !Array.isArray(json?.ocs?.data)) {
    throw createError({ statusCode: 502, statusMessage: 'Media storage links failed' })
  }
  const prefix = `/${ownerSegments(cfg, ownerId).join('/')}/`
  const links = new Map<string, string>()
  for (const share of json.ocs.data) {
    // share_type 3 = public link.
    if (Number(share?.share_type) !== 3 || !share?.url || typeof share.path !== 'string') continue
    if (share.path.startsWith(prefix)) links.set(share.path.slice(prefix.length), String(share.url).replace(/\/+$/, ''))
  }
  return links
}

// ---------------------------------------------------------------------------
// Shaping

const UUID_PREFIX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-/

/** "<uuid>-beach.jpg" → "beach.jpg" (uploads are stored uuid-prefixed). */
export const displayName = (stored: string) => stored.replace(UUID_PREFIX, '') || stored

/**
 * Flat SVAR File Manager entries: one folder per directory level
 * (category, then month) and one file per upload, named without the uuid
 * prefix — " (2)", " (3)"… keeps two "beach.jpg" in one folder apart.
 */
export function toEntries(files: StoredFile[], links: Map<string, string>): GalleryEntry[] {
  const folders = new Map<string, GalleryEntry>()
  const taken = new Set<string>()
  const entries: GalleryEntry[] = []

  for (const file of files) {
    const segments = file.path.split('/').filter(Boolean)
    const stored = segments.pop()
    if (!stored) continue

    let dir = ''
    for (const segment of segments) {
      dir += `/${segment}`
      const folder = folders.get(dir)
      // A folder's date is its newest file's (files arrive newest first).
      if (!folder) folders.set(dir, { id: dir, type: 'folder', date: file.modified ? new Date(file.modified).toISOString() : null })
    }

    const name = displayName(stored)
    const dot = name.lastIndexOf('.')
    const [base, ext] = dot > 0 ? [name.slice(0, dot), name.slice(dot)] : [name, '']
    let id = `${dir}/${name}`
    for (let n = 2; taken.has(id); n++) id = `${dir}/${base} (${n})${ext}`
    taken.add(id)

    const shareUrl = links.get(file.path) ?? null
    entries.push({
      id,
      type: 'file',
      size: file.size,
      date: file.modified ? new Date(file.modified).toISOString() : null,
      contentType: file.contentType,
      kind: kindOf(file.contentType),
      url: shareUrl ? `${shareUrl}/download` : null,
      shareUrl,
    })
  }

  return [...folders.values(), ...entries]
}

/** Uploads with a public link, as slider items. */
export function toMediaItems(files: StoredFile[], links: Map<string, string>): GalleryMediaItem[] {
  return files.flatMap((file) => {
    const shareUrl = links.get(file.path)
    if (!shareUrl) return []
    const segments = file.path.split('/').filter(Boolean)
    return [{
      id: file.path,
      name: displayName(segments.at(-1) || ''),
      contentType: file.contentType,
      kind: kindOf(file.contentType),
      size: file.size,
      date: file.modified ? new Date(file.modified).toISOString() : null,
      url: `${shareUrl}/download`,
      shareUrl,
      category: segments.length >= 3 ? segments[0]! : null,
    }]
  })
}
