import { safeJson, UnsafeUrlError } from '../safe-fetch'
import { checkText, checkUrl, isAdultHost, type SafetyConfig } from './safety'

/**
 * The video platforms members can link, each with what it takes to embed a
 * video and to check it isn't adult content. A platform is only on this list
 * when Meeovi can read the video's title (and, where the platform has one,
 * its adult/age flag) from the server: Twitch and Rumble refuse server reads,
 * Streamable has no content flag, so they aren't.
 */

export type ProviderId = 'youtube' | 'vimeo' | 'dailymotion' | 'tiktok' | 'peertube'

export const PROVIDER_LABELS: Record<ProviderId, string> = {
  youtube: 'YouTube',
  vimeo: 'Vimeo',
  dailymotion: 'Dailymotion',
  tiktok: 'TikTok',
  peertube: 'PeerTube',
}

/** A link recognised as one platform's video. */
export type ParsedLink = {
  provider: ProviderId
  /** The platform's video id; with the provider, the duplicate key. */
  id: string
  /** The address saved and linked to ("Watch on YouTube"). */
  url: string
  embedUrl: string
  /** PeerTube: the instance. */
  host?: string
}

/** What the platform says about the video. */
export type VideoMeta = {
  title: string
  description?: string
  author?: string
  thumbnail?: string
  duration?: number
  tags?: string[]
  /** The platform marks it adult / age-restricted / NSFW. */
  adult?: boolean
  /** It can't be embedded (private, removed, embedding off). */
  unavailable?: string
}

export class LinkError extends Error {
  constructor(message: string, public statusCode = 400, public code: string = 'invalid') { super(message) }
}

const YT_ID = /^[A-Za-z0-9_-]{11}$/

/** Recognises a supported platform's video link; null for anything else. */
export function parseVideoLink(input: string): ParsedLink | null {
  let url: URL
  try { url = new URL(String(input).trim()) } catch { return null }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
  const host = url.hostname.toLowerCase().replace(/^www\./, '').replace(/^m\./, '')
  const path = url.pathname.replace(/\/+$/, '')

  // YouTube: watch?v=, youtu.be/, shorts/, embed/, live/, v/
  if (['youtube.com', 'music.youtube.com', 'youtube-nocookie.com', 'youtu.be'].includes(host)) {
    const id = host === 'youtu.be'
      ? path.slice(1).split('/')[0]
      : url.searchParams.get('v') || /^\/(?:shorts|embed|live|v)\/([^/]+)/.exec(path)?.[1]
    if (!id || !YT_ID.test(id)) return null
    return { provider: 'youtube', id, url: `https://www.youtube.com/watch?v=${id}`, embedUrl: `https://www.youtube-nocookie.com/embed/${id}` }
  }

  // Vimeo: vimeo.com/123, /123/hash (unlisted), /channels/x/123, /groups/x/videos/123, player.vimeo.com/video/123?h=
  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const m = /^\/(?:video\/|channels\/[^/]+\/|groups\/[^/]+\/videos\/|showcase\/\d+\/video\/)?(\d{1,12})(?:\/([0-9a-f]{6,20}))?$/.exec(path)
    if (!m) return null
    const hash = m[2] || url.searchParams.get('h') || ''
    const safeHash = /^[0-9a-f]{6,20}$/.test(hash) ? hash : ''
    return {
      provider: 'vimeo', id: m[1]!,
      url: `https://vimeo.com/${m[1]}${safeHash ? `/${safeHash}` : ''}`,
      embedUrl: `https://player.vimeo.com/video/${m[1]}${safeHash ? `?h=${safeHash}` : ''}`,
    }
  }

  // Dailymotion: dailymotion.com/video/x8abc, dai.ly/x8abc
  if (host === 'dailymotion.com' || host === 'dai.ly' || host === 'geo.dailymotion.com') {
    const id = host === 'dai.ly' ? path.slice(1) : (/^\/video\/([a-z0-9]+)/i.exec(path)?.[1] || url.searchParams.get('video'))
    if (!id || !/^x[a-z0-9]{3,12}$/i.test(id)) return null
    return { provider: 'dailymotion', id, url: `https://www.dailymotion.com/video/${id}`, embedUrl: `https://www.dailymotion.com/embed/video/${id}` }
  }

  // TikTok: tiktok.com/@user/video/123 (short vm.tiktok.com links need the full link)
  if (host === 'tiktok.com') {
    const m = /^\/@([\w.-]{1,40})\/video\/(\d{8,25})$/.exec(path)
    if (!m) return null
    return { provider: 'tiktok', id: m[2]!, url: `https://www.tiktok.com/@${m[1]}/video/${m[2]}`, embedUrl: `https://www.tiktok.com/player/v1/${m[2]}` }
  }

  // PeerTube (any instance): /w/<short id>, /videos/watch/<uuid>, /videos/embed/<uuid>
  const pt = /^\/(?:w|videos\/watch|videos\/embed)\/([0-9a-zA-Z-]{8,36})$/.exec(path)
  if (pt && url.protocol === 'https:') {
    const instance = url.hostname.toLowerCase()
    return {
      provider: 'peertube', id: `${instance}/${pt[1]}`, host: instance,
      url: `https://${instance}/w/${pt[1]}`, embedUrl: `https://${instance}/videos/embed/${pt[1]}`,
    }
  }
  return null
}

const clip = (s: unknown, n: number) => String(s ?? '').replace(/\s+/g, ' ').trim().slice(0, n)
const httpsOrUndefined = (s: unknown) => (typeof s === 'string' && /^https:\/\//.test(s) ? s.slice(0, 1024) : undefined)

type FetchJson = <T = any>(url: string) => Promise<T>

/** Reads the video's details from its platform. */
export async function fetchMeta(link: ParsedLink, options: { youtubeApiKey?: string, fetchJson?: FetchJson } = {}): Promise<VideoMeta> {
  const get: FetchJson = options.fetchJson ?? ((url) => safeJson(url))
  const missing = (status?: number) => {
    if (status === 401 || status === 403) return 'That video is private or can\'t be embedded'
    return 'That video could not be found'
  }
  try {
    switch (link.provider) {
      case 'youtube': {
        if (options.youtubeApiKey) {
          const api = await get<any>(`https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,status&id=${link.id}&key=${encodeURIComponent(options.youtubeApiKey)}`)
          const item = api?.items?.[0]
          if (!item) return { title: '', unavailable: missing() }
          const snippet = item.snippet ?? {}
          return {
            title: clip(snippet.title, 200),
            description: clip(snippet.description, 2000),
            author: clip(snippet.channelTitle, 200),
            thumbnail: httpsOrUndefined(snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url),
            tags: Array.isArray(snippet.tags) ? snippet.tags.slice(0, 30).map((t: unknown) => clip(t, 60)) : [],
            adult: item.contentDetails?.contentRating?.ytRating === 'ytAgeRestricted',
            unavailable: item.status?.embeddable === false ? 'That video can\'t be embedded' : item.status?.privacyStatus === 'private' ? 'That video is private' : undefined,
          }
        }
        // oEmbed: 401/403 for private or embedding-disabled videos. Without an
        // API key there's no age flag, but YouTube won't play age-restricted
        // videos in an embed.
        const o = await get<any>(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(link.url)}`)
        return { title: clip(o.title, 200), author: clip(o.author_name, 200), thumbnail: httpsOrUndefined(o.thumbnail_url) }
      }
      case 'vimeo': {
        const o = await get<any>(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(link.url)}`)
        return {
          title: clip(o.title, 200), description: clip(o.description, 2000), author: clip(o.author_name, 200),
          thumbnail: httpsOrUndefined(o.thumbnail_url), duration: Number(o.duration) || undefined,
        }
      }
      case 'dailymotion': {
        const d = await get<any>(`https://api.dailymotion.com/video/${link.id}?fields=title,description,explicit,thumbnail_720_url,owner.screenname,duration,private,status,tags,allow_embed`)
        return {
          title: clip(d.title, 200), description: clip(d.description, 2000), author: clip(d['owner.screenname'], 200),
          thumbnail: httpsOrUndefined(d.thumbnail_720_url), duration: Number(d.duration) || undefined,
          tags: Array.isArray(d.tags) ? d.tags.slice(0, 30).map((t: unknown) => clip(t, 60)) : [],
          adult: d.explicit === true,
          unavailable: d.private ? 'That video is private' : d.allow_embed === false ? 'That video can\'t be embedded' : d.status && d.status !== 'published' ? 'That video isn\'t published' : undefined,
        }
      }
      case 'tiktok': {
        const o = await get<any>(`https://www.tiktok.com/oembed?url=${encodeURIComponent(link.url)}`)
        return { title: clip(o.title, 300) || 'TikTok video', author: clip(o.author_name || o.author_unique_id, 200), thumbnail: httpsOrUndefined(o.thumbnail_url) }
      }
      case 'peertube': {
        const base = `https://${link.host}`
        // An instance that calls itself NSFW is refused as a whole.
        const config = await get<any>(`${base}/api/v1/config`)
        if (!config?.serverVersion || !config?.instance) throw new LinkError('That link isn\'t a PeerTube video', 400, 'unsupported')
        const v = await get<any>(`${base}/api/v1/videos/${encodeURIComponent(link.id.split('/')[1]!)}`)
        const privacy = Number(v?.privacy?.id)
        return {
          title: clip(v.name, 200), description: clip(v.description, 2000),
          author: clip(v.account?.displayName || v.channel?.displayName, 200),
          thumbnail: v.thumbnailPath ? `${base}${String(v.thumbnailPath).startsWith('/') ? '' : '/'}${v.thumbnailPath}`.slice(0, 1024) : undefined,
          duration: Number(v.duration) || undefined,
          tags: Array.isArray(v.tags) ? v.tags.slice(0, 30).map((t: unknown) => clip(t, 60)) : [],
          // Anything but an explicit `nsfw: false` counts as NSFW.
          adult: v.nsfw !== false || config.instance?.isNSFW === true,
          unavailable: privacy && privacy !== 1 && privacy !== 2 ? 'That video is private' : undefined,
        }
      }
    }
  } catch (error: any) {
    if (error instanceof LinkError) throw error
    if (error instanceof UnsafeUrlError) throw new LinkError(error.message, 400, 'unsafe')
    const status = Number(error?.status) || 0
    if (status === 400 || status === 401 || status === 403 || status === 404) return { title: '', unavailable: missing(status) }
    throw new LinkError('The video platform didn\'t answer. Please try again in a minute.', 502, 'upstream')
  }
}

export type CheckedVideo = { link: ParsedLink, meta: VideoMeta }

/**
 * Everything a link must pass before it's saved: a supported platform, not
 * an adult host or address, the platform has the video and it can be
 * embedded, the platform doesn't flag it adult, and nothing said about it
 * (title, description, channel, tags, and the member's own title and
 * description) reads as adult.
 */
export async function checkVideoLink(
  input: string,
  options: { safety?: SafetyConfig, youtubeApiKey?: string, fetchJson?: FetchJson, memberText?: string[] } = {},
): Promise<CheckedVideo> {
  const raw = String(input || '').trim()
  if (!raw || raw.length > 2048) throw new LinkError('Paste a video link')
  let url: URL
  try { url = new URL(raw) } catch { throw new LinkError('That isn\'t a link') }
  if (!checkUrl(url, options.safety).ok) throw new LinkError(ADULT_MESSAGE, 422, 'adult')
  const link = parseVideoLink(raw)
  if (!link) throw new LinkError(`Meeovi can add videos from ${Object.values(PROVIDER_LABELS).join(', ')}. Paste the video's own link.`, 400, 'unsupported')
  if (link.host && isAdultHost(link.host, options.safety)) throw new LinkError(ADULT_MESSAGE, 422, 'adult')
  if (!checkText(options.memberText ?? [], options.safety).ok) throw new LinkError(ADULT_MESSAGE, 422, 'adult')
  const meta = await fetchMeta(link, options)
  if (meta.adult) throw new LinkError(ADULT_MESSAGE, 422, 'adult')
  if (meta.unavailable) throw new LinkError(meta.unavailable, 400, 'unavailable')
  if (!checkText([meta.title, meta.description, meta.author, meta.tags ?? []], options.safety).ok) throw new LinkError(ADULT_MESSAGE, 422, 'adult')
  return { link, meta }
}

export const ADULT_MESSAGE = 'That video can\'t be added: Meeovi doesn\'t allow adult or sexual content.'
