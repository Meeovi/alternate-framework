// OStatus (GNU social, Friendica, postActiv… — the federation before
// ActivityPub) as a network in the social layer.
//
//  - Anyone: profiles and recent posts of OStatus accounts, found with
//    WebFinger and read from their Atom feed; one post (with its replies) by
//    its id on its server.
//  - Members who connect their account (server + username + password, kept
//    encrypted by the social layer): their home timeline, posting, replies,
//    deleting their own posts, favourites, repeats and follows, through
//    their server's GNU-social-compatible API.
//
// Ids carry their server: a post is '<host>~<id>', an account
// '<host>~<user id>', because GNU social ids only mean something on the
// server that issued them.
import { parseAtom, type AtomAuthor, type AtomEntry } from './atom'
import { GnuSocialApi, normalizeServer, type ApiCredentials, type ApiStatus, type ApiUser } from './api'
import { safeFetch } from './safe-fetch'
import { findLink, parseHandle, webfinger } from './webfinger'
import type { FederatedActor, FederatedMedia, FederatedPost, FederationMember, FederationMemberSession, FederationNetwork } from './federation'

export const NETWORK = 'ostatus'
const UPDATES_FROM = 'http://schemas.google.com/g/2010#updates-from'

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", '#39': "'", nbsp: ' ' }

/** HTML → plain text. */
export function htmlToText(html: string | null | undefined): string {
  return String(html ?? '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>\s*<p[^>]*>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&(#\d+|#x[\da-f]+|[a-z]+);/gi, (m, e: string) => {
      if (e[0] === '#') {
        const code = e[1]?.toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)
        return Number.isFinite(code) ? String.fromCodePoint(code) : m
      }
      return ENTITIES[e.toLowerCase()] ?? m
    })
    .trim()
}

const https = (url?: string | null) => (url && /^https:\/\//i.test(url) ? url : undefined)

/** '<host>~<id>' ⇄ { host, id } */
export const scopedId = (host: string, id: string | number) => `${host}~${id}`
export function parseScopedId(value: string): { host: string, id: string } | null {
  const m = /^([a-z0-9.-]+\.[a-z]{2,})~([A-Za-z0-9_-]{1,64})$/i.exec(String(value || ''))
  return m ? { host: m[1]!.toLowerCase(), id: m[2]! } : null
}

// -- the API's JSON ----------------------------------------------------------------

/** A server's account as the contract's actor; `host` is the server that answered. */
export function apiActor(user: ApiUser, host: string): FederatedActor {
  const profile = https(user.statusnet_profile_url) || https(user.url)
  // Remote accounts' profile URLs are on their own server: their handle is user@thatdomain.
  const domain = profile ? new URL(profile).host : host
  return {
    id: scopedId(host, user.id),
    network: NETWORK,
    handle: `${user.screen_name}@${domain}`,
    displayName: user.name || undefined,
    avatar: https(user.profile_image_url_https) || https(user.profile_image_url_profile_size) || https(user.profile_image_url),
    bio: user.description || undefined,
    url: profile,
    followers: user.followers_count,
    following: user.friends_count,
    posts: user.statuses_count,
  }
}

const mediaKind = (mime?: string): FederatedMedia['type'] =>
  mime?.startsWith('image/') ? 'image' : mime?.startsWith('video/') ? 'video' : mime?.startsWith('audio/') ? 'audio' : 'other'

export function apiPost(status: ApiStatus, host: string): FederatedPost {
  const s = status.retweeted_status ?? status
  const html = s.statusnet_html || undefined
  return {
    id: scopedId(host, s.id),
    network: NETWORK,
    url: https(s.external_url) || https(s.uri),
    text: html ? htmlToText(html) : String(s.text ?? ''),
    html,
    createdAt: new Date(s.created_at).toISOString(),
    author: apiActor(s.user, host),
    media: (s.attachments ?? []).filter((a) => https(a.url)).map((a) => ({ url: a.url, type: mediaKind(a.mimetype) })),
    hashtags: [...String(s.text ?? '').matchAll(/(?:^|\s)#([\p{L}\p{N}_]+)/gu)].map((m) => m[1]!),
    likes: s.fave_num ?? s.favorite_count,
    reposts: s.repeat_num ?? s.retweet_count,
  }
}

// -- Atom feeds (anyone) ----------------------------------------------------------------

export function atomActor(author: AtomAuthor | undefined, handle: string): FederatedActor {
  return {
    id: author?.uri || handle,
    network: NETWORK,
    handle,
    displayName: author?.displayName || author?.name || undefined,
    avatar: https(author?.avatar),
    bio: author?.note || undefined,
    url: https(author?.profileUrl) || https(author?.uri),
  }
}

export function atomPost(entry: AtomEntry, actor: FederatedActor): FederatedPost {
  // The entry's local id is the last number in its tag/URL id, when there is one.
  const host = actor.handle.split('@')[1] || ''
  const local = /(?:noticeId=|notice\/|:)(\d+)(?:[^\d]*)$/.exec(entry.id)?.[1]
  return {
    id: local && host ? scopedId(host, local) : entry.id,
    network: NETWORK,
    url: https(entry.url) || https(entry.id),
    text: htmlToText(entry.html),
    html: entry.html,
    createdAt: entry.published || entry.updated || new Date(0).toISOString(),
    author: actor,
    media: entry.enclosures.filter((e) => https(e.href)).map((e) => ({ url: e.href, type: mediaKind(e.type) })),
    hashtags: entry.categories,
  }
}

async function feedOf(handle: string): Promise<{ actor: FederatedActor, entries: AtomEntry[] } | null> {
  const parsed = parseHandle(handle)
  if (!parsed) return null
  const jrd = await webfinger(handle)
  const feedLink = findLink(jrd, UPDATES_FROM)
  if (!feedLink?.href) return null
  const res = await safeFetch(feedLink.href, { headers: { accept: 'application/atom+xml, application/xml;q=0.9' } })
  if (!res.ok) return null
  const feed = parseAtom(res.text)
  const actor = atomActor(feed.author, `${parsed.user}@${parsed.domain}`)
  actor.avatar ??= https(findLink(jrd, 'http://webfinger.net/rel/avatar')?.href)
  actor.url ??= https(findLink(jrd, 'http://webfinger.net/rel/profile-page')?.href)
  return { actor, entries: feed.entries }
}

const isPost = (e: AtomEntry) => !e.verb || e.verb === 'post' || e.verb === 'share'

// -- members ---------------------------------------------------------------------------

const isCredentials = (v: unknown): v is ApiCredentials =>
  !!v && typeof (v as any).server === 'string' && typeof (v as any).username === 'string' && typeof (v as any).password === 'string'

/** A post id the member's server can act on, or a clear error. */
function onServer(api: GnuSocialApi, postId: string, what = 'post'): string {
  const scoped = parseScopedId(postId)
  if (!scoped) throw Object.assign(new Error(`That ${what} isn't from an OStatus server`), { statusCode: 400, statusMessage: `That ${what} isn't from an OStatus server` })
  if (scoped.host !== api.host) {
    const message = `Open it on your server (${api.host}) to do that`
    throw Object.assign(new Error(message), { statusCode: 409, statusMessage: message })
  }
  return scoped.id
}

export function createOstatusMemberSession(api: GnuSocialApi, account: FederatedActor): FederationMemberSession {
  return {
    network: NETWORK,
    account,
    async timeline({ limit = 20 } = {}) {
      return (await api.homeTimeline(Math.min(Math.max(limit, 1), 100))).map((s) => apiPost(s, api.host))
    },
    async publish({ text, replyTo }) {
      return apiPost(await api.update(text, replyTo ? onServer(api, replyTo) : undefined), api.host)
    },
    async unpublish(postId) { await api.destroy(onServer(api, postId)) },
    async like(postId) { await api.favorite(onServer(api, postId)) },
    async unlike(postId) { await api.unfavorite(onServer(api, postId)) },
    async repost(postId) { await api.repeat(onServer(api, postId)) },
    async follow(actorId) { await api.follow(onServer(api, actorId, 'account')) },
    async unfollow(actorId) { await api.unfollow(onServer(api, actorId, 'account')) },
  }
}

export async function ostatusMemberSession(member: FederationMember): Promise<FederationMemberSession | null> {
  if (!isCredentials(member.credentials)) return null
  const api = GnuSocialApi.forMember(member.credentials)
  try {
    return createOstatusMemberSession(api, apiActor(await api.verifyCredentials(), api.host))
  } catch (error: any) {
    if ([400, 401, 403].includes(error?.status)) {
      console.warn('[meeovi-ostatus] stored sign-in for', member.id, 'no longer works')
      return null
    }
    throw error
  }
}

// -- the network --------------------------------------------------------------------------

export function createOstatusNetwork(): FederationNetwork {
  return {
    id: NETWORK,
    label: 'GNU social (OStatus)',
    async status() {
      return { configured: true, connected: true, service: 'Any GNU social / OStatus server', account: null, detail: 'Profiles and posts via WebFinger and Atom; members connect their own account' }
    },
    async profile(handle) {
      const feed = await feedOf(handle)
      return feed?.actor ?? null
    },
    async feed(actor, { limit = 20 } = {}) {
      const feed = await feedOf(actor)
      if (!feed) return []
      return feed.entries.filter(isPost).slice(0, limit).map((e) => atomPost(e, feed.actor))
    },
    // One post on its server, with its direct replies (the API's public
    // show/conversation calls). The author in the address must be the post's.
    async thread(author, key, { limit = 50 } = {}) {
      const scoped = parseScopedId(key)
      if (!scoped) return null
      const api = GnuSocialApi.anonymous(`https://${scoped.host}`)
      let status: ApiStatus
      try {
        status = await api.show(scoped.id)
      } catch (error: any) {
        if ([401, 403, 404, 410].includes(error?.status)) return null
        throw error
      }
      const post = apiPost(status, scoped.host)
      const wanted = author.replace(/^@/, '').toLowerCase()
      if (post.author.handle.toLowerCase() !== wanted && post.author.id !== author) return null
      const conversationId = status.statusnet_conversation_id
      const replies = conversationId
        ? (await api.conversation(String(conversationId)).catch(() => [] as ApiStatus[]))
            .filter((s) => String(s.in_reply_to_status_id ?? '') === scoped.id).slice(0, limit).map((s) => apiPost(s, scoped.host))
        : []
      return { post, replies }
    },
    forMember: ostatusMemberSession,
    connection: {
      kind: 'account',
      description: 'Connect your GNU social (or other OStatus) account to see your home timeline on Meeovi and post, reply, favourite, repeat and follow from here.',
      notice: 'Your server only offers password sign-in for apps. Meeovi checks it with your server, stores it encrypted, and uses it only to act for you. Disconnect at any time to delete it.',
      fields: [
        { name: 'server', label: 'Server', type: 'url', placeholder: 'https://gnusocial.example', hint: 'The address of your GNU social server' },
        { name: 'username', label: 'Username', type: 'text', placeholder: 'alice' },
        { name: 'password', label: 'Password', type: 'password' },
      ],
      async connect(input) {
        const server = normalizeServer(String(input.server || ''))
        const username = String(input.username || '').replace(/^@/, '').replace(/@.*$/, '')
        if (!/^[A-Za-z0-9_.-]{1,64}$/.test(username)) throw new Error('Enter your username without the server')
        const credentials: ApiCredentials = { server, username, password: String(input.password || '') }
        let user: ApiUser
        try {
          user = await GnuSocialApi.forMember(credentials).verifyCredentials()
        } catch (error: any) {
          // StatusNet-era servers answer a failed sign-in with 400, newer ones 401/403.
          if ([400, 401, 403].includes(error?.status)) throw new Error('Your server did not accept that username and password')
          if (error?.status === 404) throw new Error(`${new URL(server).host} does not offer the GNU social API`)
          throw new Error(error?.message || `Couldn't reach ${new URL(server).host}`)
        }
        const account = apiActor(user, new URL(server).host)
        return { account: account.handle, service: server, credentials }
      },
    },
  }
}
