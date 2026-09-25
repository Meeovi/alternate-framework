import { randomUUID } from 'node:crypto'

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
  // Prefix with a uuid so two uploads of "image.jpg" never collide and a
  // public link can't be guessed from the original filename.
  const filename = `${randomUUID()}-${sanitizeSegment(input.filename)}`

  await ensureFolders(cfg, folder)

  const put = await fetch(davUrl(cfg, [...folder, filename]), {
    method: 'PUT',
    headers: {
      Authorization: authHeader(cfg),
      'Content-Type': input.contentType || 'application/octet-stream',
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
    contentType: input.contentType,
    size: input.data.byteLength,
  }
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
