// Zot (Hubzilla and Streams: nomadic identity, channels that can move
// between hubs) as a network in the social layer.
//
//  - Anyone: a channel's profile, found with WebFinger and read with Zot
//    discovery (its channel URL as application/x-zot+json); its recent
//    public posts and single posts through the ActivityPub side most hubs
//    run (Hubzilla's pubcrawl add-on; built into Streams).
//  - Members who connect their channel (hub + channel nickname + password,
//    kept encrypted by the social layer): their network stream, posting and
//    replying, through the hub's own API (api/z/1.0). Hubzilla's API has no
//    like / boost / follow calls, so those stay on the hub.
//
// A post's id is its Zot message id (a URL) in base64url, so it can sit in a
// Meeovi address (/connect/note/@channel@hub/zot:<id>).
import { bbcodeImages, bbcodeToHtml, bbcodeToText } from './bbcode'
import { ZotApi, normalizeHub, type ZotChannel, type ZotCredentials, type ZotItem, type ZotXchan } from './api'
import { safeJson } from './safe-fetch'
import { findLink, parseHandle, webfinger } from './webfinger'
import type { FederatedActor, FederatedPost, FederationMember, FederationMemberSession, FederationNetwork } from './federation'

export const NETWORK = 'zot'
const ZOT_RELS = ['http://purl.org/zot/protocol/6.0', 'http://purl.org/zot/protocol']
const AS_ACCEPT = 'application/activity+json, application/ld+json; profile="https://www.w3.org/ns/activitystreams"'

const https = (url?: string | null) => (url && /^https:\/\//i.test(url) ? url : undefined)

export const encodeMid = (mid: string) => Buffer.from(mid, 'utf8').toString('base64url')
export function decodeMid(key: string): string | null {
  if (!/^[A-Za-z0-9_-]{8,700}$/.test(key)) return null
  const mid = Buffer.from(key, 'base64url').toString('utf8')
  return /^https:\/\/[^\s]+$/i.test(mid) ? mid : null
}

// -- members' items (api/z/1.0) --------------------------------------------------------

export function xchanActor(x: ZotXchan | undefined, fallbackHandle = ''): FederatedActor {
  const handle = x?.address || fallbackHandle
  return {
    id: x?.url || handle,
    network: NETWORK,
    handle,
    displayName: x?.name || undefined,
    avatar: https(x?.photo?.src),
    url: https(x?.url),
  }
}

const isTopLevelPost = (item: ZotItem) =>
  !Number(item.item_deleted)
  && (!item.message_top || item.message_top === item.message_id)
  && (!item.verb || /(^|\/)(post|Create)$/i.test(item.verb))

export function itemPost(item: ZotItem): FederatedPost {
  const body = String(item.body ?? '')
  const titled = item.title ? `[b]${item.title}[/b]\n${body}` : body
  return {
    id: encodeMid(item.message_id),
    network: NETWORK,
    url: https(item.permalink) || https(item.message_id),
    text: bbcodeToText(titled),
    html: bbcodeToHtml(titled),
    createdAt: new Date(`${String(item.created).replace(' ', 'T')}Z`).toISOString(),
    author: xchanActor(item.author),
    media: [
      ...bbcodeImages(body).map((url) => ({ url, type: 'image' as const })),
      ...(item.attach ?? []).filter((a) => https(a?.href)).map((a) => ({ url: a.href!, type: (a.type?.startsWith('image/') ? 'image' : a.type?.startsWith('video/') ? 'video' : a.type?.startsWith('audio/') ? 'audio' : 'other') as 'image' | 'video' | 'audio' | 'other' })),
    ],
    hashtags: [...body.matchAll(/(?:^|\s)#([\p{L}\p{N}_]+)/gu)].map((m) => m[1]!),
  }
}

export function channelActor(channel: ZotChannel, host: string): FederatedActor {
  const handle = channel.xchan_addr || `${channel.channel_address}@${host}`
  return {
    id: channel.xchan_url || `https://${host}/channel/${channel.channel_address}`,
    network: NETWORK,
    handle,
    displayName: channel.channel_name || undefined,
    avatar: https(channel.xchan_photo_m) || https(channel.xchan_photo_l),
    url: https(channel.xchan_url) || `https://${host}/channel/${channel.channel_address}`,
  }
}

const isCredentials = (v: unknown): v is ZotCredentials =>
  !!v && typeof (v as any).hub === 'string' && typeof (v as any).channel === 'string' && typeof (v as any).password === 'string'

export function createZotMemberSession(api: ZotApi, account: FederatedActor): FederationMemberSession {
  return {
    network: NETWORK,
    account,
    async timeline({ limit = 20 } = {}) {
      // The stream holds comments and likes too; ask for more and keep the posts.
      const items = await api.networkStream(Math.min(Math.max(limit, 1), 50) * 3)
      return items.filter(isTopLevelPost).slice(0, limit).map(itemPost)
    },
    async publish({ text, replyTo }) {
      const parentMid = replyTo ? decodeMid(replyTo) : undefined
      if (replyTo && !parentMid) throw Object.assign(new Error('That post isn\'t from a Zot hub'), { statusCode: 400, statusMessage: 'That post isn\'t from a Zot hub' })
      const saved = await api.post(text, parentMid ?? undefined)
      const item = saved.item ?? {}
      return itemPost({
        message_id: String(item.mid ?? ''),
        message_top: String(item.parent_mid ?? item.mid ?? ''),
        created: String(item.created ?? new Date().toISOString().slice(0, 19).replace('T', ' ')),
        title: item.title,
        body: item.body ?? text,
        permalink: item.plink,
        author: { name: account.displayName, address: account.handle, url: account.url, photo: { src: account.avatar } },
      })
    },
  }
}

export async function zotMemberSession(member: FederationMember): Promise<FederationMemberSession | null> {
  if (!isCredentials(member.credentials)) return null
  const api = new ZotApi(member.credentials)
  try {
    return createZotMemberSession(api, channelActor(await api.verify(), api.host))
  } catch (error: any) {
    if (error?.status === 401 || error?.status === 403) {
      console.warn('[meeovi-zot] stored sign-in for', member.id, 'no longer works')
      return null
    }
    throw error
  }
}

// -- anyone: discovery and the ActivityPub side -------------------------------------------

type ZotInfo = {
  id?: string
  name?: string
  username?: string
  photo?: { url?: string }
  primary_location?: { address?: string, url?: string }
  profile?: { description?: string, about?: string }
  searchable?: boolean
  deleted?: boolean
  public_forum?: boolean
}

async function discover(handle: string): Promise<{ actor: FederatedActor, apActor?: string } | null> {
  const parsed = parseHandle(handle)
  if (!parsed) return null
  const jrd = await webfinger(handle)
  const zotLink = ZOT_RELS.map((rel) => findLink(jrd, rel)).find(Boolean)
  if (!zotLink?.href) return null // not a Zot channel
  const apActor = jrd?.links?.find((l) => l.rel === 'self' && /activity\+json|ld\+json/.test(l.type ?? '') && l.href)?.href
  let info: ZotInfo = {}
  try {
    const raw = await safeJson<ZotInfo & { data?: ZotInfo }>(zotLink.href, { headers: { accept: 'application/x-zot+json' } })
    info = raw?.primary_location || raw?.name ? raw : (raw?.data ?? {})
  } catch { /* fall back to what WebFinger says */ }
  if (info.deleted) return null
  return {
    apActor,
    actor: {
      id: info.id || zotLink.href,
      network: NETWORK,
      handle: info.primary_location?.address || `${parsed.user}@${parsed.domain}`,
      displayName: info.name || undefined,
      avatar: https(info.photo?.url) || https(findLink(jrd, 'http://webfinger.net/rel/avatar')?.href),
      bio: (info.profile?.description || info.profile?.about || '').slice(0, 1000) || undefined,
      url: https(info.primary_location?.url) || https(findLink(jrd, 'http://webfinger.net/rel/profile-page')?.href),
    },
  }
}

type AsObject = { id?: string, type?: string | string[], content?: string, summary?: string, name?: string, published?: string, url?: string | { href?: string } | ({ href?: string } | string)[], attributedTo?: string | { id?: string }, attachment?: { url?: string | { href?: string }[], mediaType?: string, type?: string }[], tag?: { type?: string, name?: string }[], sensitive?: boolean, to?: string[], cc?: string[], inReplyTo?: string | null }

const firstUrl = (u: AsObject['url']): string | undefined => {
  const v = Array.isArray(u) ? u[0] : u
  return typeof v === 'string' ? v : v?.href
}
const PUBLIC = 'https://www.w3.org/ns/activitystreams#Public'
const isPublic = (o: AsObject) => [...(o.to ?? []), ...(o.cc ?? [])].some((a) => a === PUBLIC || a === 'as:Public' || a === 'Public')

export function asPost(object: AsObject, actor: FederatedActor): FederatedPost | null {
  if (!object.id || !/^https:\/\//.test(object.id) || object.sensitive) return null
  const html = [object.name ? `<p><strong>${object.name}</strong></p>` : '', object.content ?? ''].join('')
  return {
    id: encodeMid(object.id),
    network: NETWORK,
    url: https(firstUrl(object.url)) || object.id,
    text: html.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim(),
    html,
    createdAt: object.published || new Date(0).toISOString(),
    author: actor,
    media: (object.attachment ?? []).map((a) => ({ url: typeof a.url === 'string' ? a.url : a.url?.[0]?.href ?? '', mediaType: a.mediaType ?? '' }))
      .filter((a) => https(a.url)).map((a) => ({ url: a.url, type: a.mediaType.startsWith('image/') ? 'image' as const : a.mediaType.startsWith('video/') ? 'video' as const : a.mediaType.startsWith('audio/') ? 'audio' as const : 'other' as const })),
    hashtags: (object.tag ?? []).filter((t) => t.type === 'Hashtag' && t.name).map((t) => t.name!.replace(/^#/, '')),
  }
}

async function outboxPosts(apActor: string, actor: FederatedActor, limit: number): Promise<FederatedPost[]> {
  const person = await safeJson<{ outbox?: string }>(apActor, { headers: { accept: AS_ACCEPT } })
  if (!person?.outbox) return []
  let page = await safeJson<{ first?: string | { orderedItems?: any[] }, orderedItems?: any[] }>(person.outbox, { headers: { accept: AS_ACCEPT }, maxBytes: 8 * 1024 * 1024 })
  if (!page.orderedItems && typeof page.first === 'string') page = await safeJson(page.first, { headers: { accept: AS_ACCEPT }, maxBytes: 8 * 1024 * 1024 })
  const items = page.orderedItems ?? (typeof page.first === 'object' ? page.first?.orderedItems : []) ?? []
  const posts: FederatedPost[] = []
  for (const activity of items) {
    if (posts.length >= limit) break
    const type = Array.isArray(activity?.type) ? activity.type[0] : activity?.type
    const object = activity?.object
    if (type !== 'Create' || !object || typeof object !== 'object' || object.inReplyTo || !isPublic(object)) continue
    const post = asPost(object, actor)
    if (post) posts.push(post)
  }
  return posts
}

export function createZotNetwork(): FederationNetwork {
  return {
    id: NETWORK,
    label: 'Hubzilla & Streams (Zot)',
    async status() {
      return { configured: true, connected: true, service: 'Any Hubzilla or Streams hub', account: null, detail: 'Channels via WebFinger and Zot discovery; members connect their own channel' }
    },
    async profile(handle) {
      return (await discover(handle))?.actor ?? null
    },
    async feed(handle, { limit = 20 } = {}) {
      const found = await discover(handle)
      if (!found?.apActor) return []
      return outboxPosts(found.apActor, found.actor, limit).catch(() => [])
    },
    // One public post by its message id, read from its hub as ActivityStreams.
    async thread(author, key) {
      const mid = decodeMid(key)
      if (!mid) return null
      const found = await discover(author)
      if (!found) return null
      let object: AsObject
      try {
        object = await safeJson<AsObject>(mid, { headers: { accept: AS_ACCEPT } })
      } catch (error: any) {
        if ([401, 403, 404, 410].includes(error?.status)) return null
        throw error
      }
      // The post must be the channel's (by its ActivityPub actor or channel URL).
      const by = typeof object.attributedTo === 'string' ? object.attributedTo : object.attributedTo?.id
      if (!by || ![found.apActor, found.actor.id, found.actor.url].includes(by) || !isPublic(object)) return null
      const post = asPost({ ...object, id: mid }, found.actor)
      return post ? { post, replies: [] } : null
    },
    forMember: zotMemberSession,
    connection: {
      kind: 'account',
      description: 'Connect your Hubzilla or Streams channel to see your network stream on Meeovi and post and reply from here.',
      notice: 'Hubzilla\'s API only signs in with your channel password. Meeovi checks it with your hub, stores it encrypted, and uses it only to act for you. Disconnect at any time to delete it.',
      fields: [
        { name: 'hub', label: 'Hub', type: 'url', placeholder: 'https://hub.example', hint: 'The hub your channel lives on' },
        { name: 'channel', label: 'Channel nickname', type: 'text', placeholder: 'alice', hint: 'The part before @ in your channel address' },
        { name: 'password', label: 'Password', type: 'password' },
      ],
      async connect(input) {
        const hub = normalizeHub(String(input.hub || ''))
        const channel = String(input.channel || '').replace(/^@/, '').replace(/@.*$/, '')
        if (!/^[A-Za-z0-9_.-]{1,64}$/.test(channel)) throw new Error('Enter your channel nickname without the hub')
        const credentials: ZotCredentials = { hub, channel, password: String(input.password || '') }
        let found: ZotChannel
        try {
          found = await new ZotApi(credentials).verify()
        } catch (error: any) {
          if (error?.status === 401 || error?.status === 403) throw new Error('Your hub did not accept that channel and password')
          if (error?.status === 404) throw new Error(`${new URL(hub).host} does not look like a Hubzilla or Streams hub`)
          throw new Error(error?.message || `Couldn't reach ${new URL(hub).host}`)
        }
        return { account: channelActor(found, new URL(hub).host).handle, service: hub, credentials }
      },
    },
  }
}
