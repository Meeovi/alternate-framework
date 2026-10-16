import { randomUUID } from 'node:crypto'
import { sniffMedia } from './mediaSniff'

/**
 * Pixanomy (app.pixanomy.com) is the centralized asset store for every
 * file a user uploads anywhere in Meeovi — it's a Nextcloud instance, so
 * this talks to it over the two standard Nextcloud APIs:
 *
 *   - WebDAV (`/remote.php/dav/files/<user>/…`) to create folders and PUT
 *     the file itself
 *   - OCS Share API (`/ocs/v2.php/apps/files_sharing/api/v1/shares`) to mint
 *     a read-only public link, which is what gets stored on the content
 *     record and rendered in <img>/<video> tags (getAssetURL() passes full
 *     URLs straight through)
 *
 * Everything is written as a single service account (an app password, not
 * the account's real password) under `<root>/<ownerId>/<category>/<yyyy-mm>/`,
 * so one user's uploads are never interleaved with another's and a whole
 * user can be exported/removed by deleting one folder.
 *
 * Env: NUXT_PIXANOMY_URL, NUXT_PIXANOMY_USERNAME, NUXT_PIXANOMY_APP_PASSWORD,
 * NUXT_PIXANOMY_ROOT (see layers/shared/nuxt.config.ts runtimeConfig.pixanomy).
 */

export interface PixanomyUploadInput {
  data: Uint8Array
  filename: string
  contentType: string
  /** Stable id of the owner — the better-auth user id, or a signup id. */
  ownerId: string
  /** Top-level grouping under the owner folder, e.g. "posts", "avatars". */
  category?: string
}

export interface PixanomyAsset {
  /** Public direct-download URL — what callers should store and render. */
  url: string
  /** Public share page URL (Nextcloud's viewer). */
  shareUrl: string
  /** Path inside the service account's files, for later deletion. */
  path: string
  /** Nextcloud file id, when the server returns one. */
  fileId: string | null
  filename: string
  contentType: string
  size: number
}

interface PixanomyConfig {
  url: string
  username: string
  appPassword: string
  root: string
}

function getPixanomyConfig(): PixanomyConfig {
  const cfg = (useRuntimeConfig() as any).pixanomy || {}
  const url = String(cfg.url || '').replace(/\/+$/, '')
  if (!url || !cfg.username || !cfg.appPassword) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Asset storage is not configured',
    })
  }
  return {
    url,
    username: String(cfg.username),
    appPassword: String(cfg.appPassword),
    root: String(cfg.root || 'Meeovi').replace(/^\/+|\/+$/g, ''),
  }
}

export function isPixanomyConfigured(): boolean {
  const cfg = (useRuntimeConfig() as any).pixanomy || {}
  return Boolean(cfg.url && cfg.username && cfg.appPassword)
}

function authHeader(cfg: PixanomyConfig) {
  return 'Basic ' + Buffer.from(`${cfg.username}:${cfg.appPassword}`).toString('base64')
}

// Path segments come from user ids and user-supplied filenames — keep them
// to a conservative charset so nothing can climb out of the owner folder
// (`..`) or produce a path Nextcloud rejects.
export function sanitizeSegment(value: string, fallback = 'file'): string {
  const cleaned = value
    .normalize('NFKD')
    .replace(/[^\w.-]+/g, '-')
    .replace(/^[.-]+|[.-]+$/g, '')
    .replace(/-{2,}/g, '-')
    .slice(0, 100)
  return cleaned || fallback
}

function davUrl(cfg: PixanomyConfig, segments: string[]) {
  const encoded = segments.map((s) => encodeURIComponent(s)).join('/')
  return `${cfg.url}/remote.php/dav/files/${encodeURIComponent(cfg.username)}/${encoded}`
}

async function ensureFolders(cfg: PixanomyConfig, segments: string[]) {
  // MKCOL each level; 405 means it already exists. Nextcloud has no
  // "mkdir -p", so walk the path from the top.
  for (let i = 1; i <= segments.length; i++) {
    const res = await fetch(davUrl(cfg, segments.slice(0, i)), {
      method: 'MKCOL',
      headers: { Authorization: authHeader(cfg) },
    })
    if (!res.ok && res.status !== 405) {
      throw createError({
        statusCode: 502,
        statusMessage: `Asset storage folder create failed (${res.status})`,
      })
    }
  }
}

async function createPublicLink(cfg: PixanomyConfig, path: string) {
  const body = new URLSearchParams({ path, shareType: '3', permissions: '1' })
  const res = await fetch(`${cfg.url}/ocs/v2.php/apps/files_sharing/api/v1/shares?format=json`, {
    method: 'POST',
    headers: {
      Authorization: authHeader(cfg),
      'OCS-APIRequest': 'true',
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  })
  const json: any = await res.json().catch(() => null)
  const shareUrl: string | undefined = json?.ocs?.data?.url
  if (!res.ok || !shareUrl) {
    throw createError({
      statusCode: 502,
      statusMessage: `Asset storage share failed (${json?.ocs?.meta?.message || res.status})`,
    })
  }
  return shareUrl.replace(/\/+$/, '')
}

export async function uploadToPixanomy(input: PixanomyUploadInput): Promise<PixanomyAsset> {
  const cfg = getPixanomyConfig()

  const now = new Date()
  const month = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`
  const folder = [
    ...cfg.root.split('/').filter(Boolean),
    sanitizeSegment(input.ownerId, 'anonymous'),
    sanitizeSegment(input.category || 'uploads', 'uploads'),
    month,
  ]
  // The declared type is whatever the browser (or a script) claimed — store
  // the file as what its bytes actually are, or not at all.
  const contentType = detectAssetType(input.data, input.contentType)
  if (!contentType) {
    throw createError({ statusCode: 415, statusMessage: `${input.filename}: file contents don't match an allowed type` })
  }

  // Prefix with a uuid so two uploads of "image.jpg" never collide and a
  // public link can't be guessed from the original filename. Nextcloud
  // serves files by extension, so the extension always matches the real type.
  const filename = `${randomUUID()}-${withExtension(sanitizeSegment(input.filename), contentType)}`

  await ensureFolders(cfg, folder)

  const put = await fetch(davUrl(cfg, [...folder, filename]), {
    method: 'PUT',
    headers: {
      Authorization: authHeader(cfg),
      'Content-Type': contentType,
    },
    // TS 5.7+ types Uint8Array<ArrayBufferLike> as not assignable to BodyInit
    // (it could be SharedArrayBuffer-backed); ours is always a plain buffer.
    body: input.data as Uint8Array<ArrayBuffer>,
  })
  if (!put.ok) {
    throw createError({
      statusCode: 502,
      statusMessage: `Asset storage upload failed (${put.status})`,
    })
  }

  const path = '/' + [...folder, filename].join('/')
  const shareUrl = await createPublicLink(cfg, path)

  return {
    url: `${shareUrl}/download`,
    shareUrl,
    path,
    fileId: put.headers.get('oc-fileid'),
    filename: input.filename,
    contentType,
    size: input.data.byteLength,
  }
}

export interface PixanomyListedAsset {
  fileId: string | null
  filename: string
  contentType: string
  size: number
  modified: string | null
  /** Public direct-download URL (the upload's existing public link). */
  url: string
  shareUrl: string
  /** Upload category folder, e.g. "posts", "vibez", "avatars". */
  category: string | null
}

function xmlDecode(value: string) {
  return value
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'").replace(/&amp;/g, '&')
}

function xmlTag(block: string, tag: string) {
  const m = new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`).exec(block)
  return m ? xmlDecode(m[1]!) : null
}

async function findPublicLink(cfg: PixanomyConfig, path: string) {
  const qs = new URLSearchParams({ path, reshares: 'false', format: 'json' })
  const res = await fetch(`${cfg.url}/ocs/v2.php/apps/files_sharing/api/v1/shares?${qs}`, {
    headers: { Authorization: authHeader(cfg), 'OCS-APIRequest': 'true', Accept: 'application/json' },
  })
  const json: any = await res.json().catch(() => null)
  const link = (json?.ocs?.data || []).find((share: any) => Number(share?.share_type) === 3 && share?.url)
  return link ? String(link.url).replace(/\/+$/, '') : null
}

/**
 * The owner's own uploads (images/videos by default), newest first — read
 * with a WebDAV SEARCH scoped to `<root>/<ownerId>`, so it can only ever
 * return files that uploadToPixanomy() wrote for that owner. Each file's
 * existing public link is reused (created if it's somehow missing), since
 * that's what the rest of Meeovi renders.
 */
export async function listPixanomyAssets(
  ownerId: string,
  { limit = 12, types = ['image/', 'video/'] }: { limit?: number, types?: string[] } = {},
): Promise<PixanomyListedAsset[]> {
  const cfg = getPixanomyConfig()
  const owner = sanitizeSegment(ownerId, 'anonymous')
  const scope = ['files', cfg.username, ...cfg.root.split('/').filter(Boolean), owner]
    .map((s) => encodeURIComponent(s)).join('/')

  const typeFilter = types
    .map((t) => `<d:like><d:prop><d:getcontenttype/></d:prop><d:literal>${t.replace(/[<&]/g, '')}%</d:literal></d:like>`)
    .join('')
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<d:searchrequest xmlns:d="DAV:" xmlns:oc="http://owncloud.org/ns">
  <d:basicsearch>
    <d:select><d:prop><d:getcontenttype/><d:getlastmodified/><d:getcontentlength/><oc:fileid/></d:prop></d:select>
    <d:from><d:scope><d:href>/${scope}</d:href><d:depth>infinity</d:depth></d:scope></d:from>
    <d:where>${types.length > 1 ? `<d:or>${typeFilter}</d:or>` : typeFilter}</d:where>
    <d:orderby><d:order><d:prop><d:getlastmodified/></d:prop><d:descending/></d:order></d:orderby>
    <d:limit><d:nresults>${Math.max(1, Math.min(50, Math.floor(limit)))}</d:nresults></d:limit>
  </d:basicsearch>
</d:searchrequest>`

  const res = await fetch(`${cfg.url}/remote.php/dav/`, {
    method: 'SEARCH',
    headers: { Authorization: authHeader(cfg), 'Content-Type': 'text/xml; charset=utf-8' },
    body,
  })
  // No folder yet = the owner has never uploaded anything.
  if (res.status === 404) return []
  if (!res.ok) {
    throw createError({ statusCode: 502, statusMessage: `Asset storage search failed (${res.status})` })
  }

  const xml = await res.text()
  const davPrefix = `/remote.php/dav/files/${encodeURIComponent(cfg.username)}`
  const files = [...xml.matchAll(/<d:response>([\s\S]*?)<\/d:response>/g)]
    .map(([, block]) => {
      const href = xmlTag(block!, 'd:href') || ''
      const contentType = xmlTag(block!, 'd:getcontenttype') || ''
      if (!contentType || href.endsWith('/')) return null
      // "/remote.php/dav/files/<svc>/Meeovi/<owner>/<category>/<yyyy-mm>/<uuid>-<name>"
      const path = decodeURIComponent(href.slice(href.indexOf(davPrefix) + davPrefix.length))
      const segments = path.split('/').filter(Boolean)
      const stored = segments.at(-1) || ''
      return {
        path,
        fileId: xmlTag(block!, 'oc:fileid'),
        filename: stored.replace(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-/, ''),
        contentType,
        size: Number(xmlTag(block!, 'd:getcontentlength') || 0),
        modified: xmlTag(block!, 'd:getlastmodified'),
        category: segments.length >= 4 ? segments.at(-3)! : null,
      }
    })
    .filter((f): f is NonNullable<typeof f> => Boolean(f))

  return Promise.all(files.map(async ({ path, ...file }) => {
    const shareUrl = (await findPublicLink(cfg, path)) || (await createPublicLink(cfg, path))
    return { ...file, shareUrl, url: `${shareUrl}/download` }
  }))
}

/** Decode a `data:<mime>;base64,<…>` URL — e.g. a signup avatar. */
export function decodeDataUrl(value: string): { data: Uint8Array, contentType: string } | null {
  const match = /^data:([\w.+-]+\/[\w.+-]+);base64,(.+)$/s.exec(value)
  if (!match) return null
  return { contentType: match[1]!, data: new Uint8Array(Buffer.from(match[2]!, 'base64')) }
}

// Only the kinds of media users are actually meant to upload. Anything
// executable/HTML-ish (text/html, image/svg+xml, application/javascript…)
// is refused: it'd be served from app.pixanomy.com under a public link.
const ALLOWED_TYPES: RegExp[] = [
  /^image\/(png|jpe?g|gif|webp|avif|heic|heif)$/,
  /^video\/(mp4|webm|quicktime|x-matroska|ogg)$/,
  /^audio\/(mpeg|mp4|aac|ogg|wav|x-wav|webm|flac)$/,
  /^application\/pdf$/,
  /^text\/plain$/,
  /^application\/(msword|vnd\.openxmlformats-officedocument\.[\w.]+|vnd\.oasis\.opendocument\.[\w.]+)$/,
  /^application\/zip$/,
]

export function isAllowedAssetType(contentType: string): boolean {
  return ALLOWED_TYPES.some((re) => re.test(contentType.toLowerCase()))
}

// -- Real file types ----------------------------------------------------------

const OFFICE_TYPE = /^application\/(msword|vnd\.openxmlformats-officedocument\.[\w.]+|vnd\.oasis\.opendocument\.[\w.]+)$/

const latin1 = (b: Uint8Array, at: number, len: number) =>
  at + len > b.length ? '' : Buffer.from(b.buffer, b.byteOffset + at, len).toString('latin1')

/**
 * What an upload really is, from its bytes (magic numbers / container
 * structure), restricted to the allowed types. Returns the MIME type to
 * store it under, or null to refuse it. `declared` only picks between
 * formats the bytes can't tell apart (Office files are zips; text is text).
 */
export function detectAssetType(data: Uint8Array, declared = ''): string | null {
  const d = declared.toLowerCase().split(';')[0]!.trim()
  const b = data
  const has = (at: number, ...bytes: number[]) => bytes.every((v, i) => b[at + i] === v)
  let type: string | null = null

  if (has(0, 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) type = 'image/png'
  else if (has(0, 0xff, 0xd8, 0xff)) type = 'image/jpeg'
  else if (latin1(b, 0, 6) === 'GIF87a' || latin1(b, 0, 6) === 'GIF89a') type = 'image/gif'
  else if (latin1(b, 0, 4) === 'RIFF' && latin1(b, 8, 4) === 'WEBP') type = 'image/webp'
  else if (latin1(b, 4, 4) === 'ftyp' && /^(avif|avis)$/.test(latin1(b, 8, 4))) type = 'image/avif'
  else if (latin1(b, 4, 4) === 'ftyp' && /^(heic|heix|hevc|hevx|heim|heis|mif1|msf1)$/.test(latin1(b, 8, 4))) type = 'image/heic'
  else if (latin1(b, 0, 5) === '%PDF-') type = 'application/pdf'
  else if (has(0, 0x50, 0x4b, 0x03, 0x04)) {
    // Office Open XML / OpenDocument files are zips with a telltale entry.
    const head = latin1(b, 0, Math.min(b.length, 4096))
    const office = head.includes('[Content_Types].xml') || latin1(b, 30, 8) === 'mimetype'
    type = office && OFFICE_TYPE.test(d) && d !== 'application/msword' ? d : 'application/zip'
  } else if (has(0, 0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1)) {
    // Legacy (OLE) Word file — only when that's what was declared.
    type = d === 'application/msword' ? d : null
  } else {
    const media = sniffMedia(b)
    if (media) type = media.type
    else if (d === 'text/plain' && isPlainText(b)) type = 'text/plain'
  }

  return type && isAllowedAssetType(type) ? type : null
}

/** UTF-8 text with no NUL bytes (binary). */
function isPlainText(b: Uint8Array): boolean {
  if (b.includes(0)) return false
  try { new TextDecoder('utf-8', { fatal: true }).decode(b); return true } catch { return false }
}

const EXTENSIONS: Record<string, string> = {
  'image/png': 'png', 'image/jpeg': 'jpg', 'image/gif': 'gif', 'image/webp': 'webp', 'image/avif': 'avif', 'image/heic': 'heic',
  'video/mp4': 'mp4', 'video/webm': 'webm', 'video/quicktime': 'mov', 'video/x-matroska': 'mkv', 'video/ogg': 'ogv',
  'audio/mpeg': 'mp3', 'audio/mp4': 'm4a', 'audio/aac': 'aac', 'audio/ogg': 'ogg', 'audio/wav': 'wav', 'audio/webm': 'weba',
  'audio/flac': 'flac', 'audio/x-matroska': 'mka',
  'application/pdf': 'pdf', 'text/plain': 'txt', 'application/zip': 'zip', 'application/msword': 'doc',
}
const OFFICE_EXTENSIONS = /^(docx|xlsx|pptx|odt|ods|odp|odg)$/i

/** `name.ext` with ext replaced by the one for `contentType`. */
function withExtension(name: string, contentType: string): string {
  const dot = name.lastIndexOf('.')
  const base = dot > 0 ? name.slice(0, dot) : name
  const current = dot > 0 ? name.slice(dot + 1) : ''
  const ext = EXTENSIONS[contentType] ?? (OFFICE_EXTENSIONS.test(current) ? current.toLowerCase() : 'bin')
  return `${base || 'file'}.${ext}`
}
