// The GNU-social-compatible ("StatusNet" / Twitter v1) API that GNU social,
// Friendica and other OStatus-era servers offer, with HTTP Basic auth —
// how Meeovi acts for a member who connected their account.
import { safeFetch, safeJson, assertSafeUrl } from './safe-fetch'

export type ApiUser = {
  id: number | string
  name?: string
  screen_name: string
  description?: string | null
  profile_image_url?: string | null
  profile_image_url_https?: string | null
  profile_image_url_profile_size?: string | null
  statusnet_profile_url?: string | null
  url?: string | null
  followers_count?: number
  friends_count?: number
  statuses_count?: number
}

export type ApiStatus = {
  id: number | string
  text?: string
  statusnet_html?: string
  created_at: string
  uri?: string
  external_url?: string
  in_reply_to_status_id?: number | string | null
  user: ApiUser
  fave_num?: number
  favorite_count?: number
  repeat_num?: number
  retweet_count?: number
  statusnet_conversation_id?: number | string
  attachments?: { url: string, mimetype?: string }[]
  retweeted_status?: ApiStatus | null
}

export type ApiCredentials = { server: string, username: string, password: string }

/** 'https://social.example/' or 'social.example' → 'https://social.example' (https only). */
export function normalizeServer(server: string): string {
  const raw = String(server || '').trim()
  const url = assertSafeUrl(/^[a-z]+:\/\//i.test(raw) ? raw : `https://${raw}`)
  return `${url.origin}${url.pathname.replace(/\/+$/, '').replace(/\/index\.php$/, '')}`
}

export class GnuSocialApi {
  constructor(private readonly creds: ApiCredentials | null, private readonly server: string) {}

  static forMember(creds: ApiCredentials) { return new GnuSocialApi(creds, normalizeServer(creds.server)) }
  static anonymous(server: string) { return new GnuSocialApi(null, normalizeServer(server)) }

  get host() { return new URL(this.server).host }

  private headers(): Record<string, string> {
    return this.creds ? { authorization: `Basic ${Buffer.from(`${this.creds.username}:${this.creds.password}`).toString('base64')}` } : {}
  }

  async get<T>(path: string, query: Record<string, string | number | undefined> = {}): Promise<T> {
    const url = new URL(`${this.server}/api/${path}`)
    for (const [k, v] of Object.entries(query)) if (v !== undefined) url.searchParams.set(k, String(v))
    return safeJson<T>(url, { headers: this.headers() })
  }

  async post<T>(path: string, form: Record<string, string | number | undefined> = {}): Promise<T> {
    const body = new URLSearchParams()
    for (const [k, v] of Object.entries(form)) if (v !== undefined) body.set(k, String(v))
    const res = await safeFetch(`${this.server}/api/${path}`, {
      method: 'POST',
      headers: { ...this.headers(), accept: 'application/json', 'content-type': 'application/x-www-form-urlencoded' },
      body,
    })
    if (!res.ok) throw Object.assign(new Error(apiError(res.text) || `${this.host} answered ${res.status}`), { status: res.status })
    try { return JSON.parse(res.text) as T } catch { return {} as T }
  }

  verifyCredentials() { return this.get<ApiUser>('account/verify_credentials.json') }
  homeTimeline(count: number) { return this.get<ApiStatus[]>('statuses/home_timeline.json', { count }) }
  show(id: string) { return this.get<ApiStatus>(`statuses/show/${encodeURIComponent(id)}.json`) }
  conversation(id: string, count = 100) { return this.get<ApiStatus[]>(`statusnet/conversation/${encodeURIComponent(id)}.json`, { count }) }
  update(status: string, inReplyTo?: string) { return this.post<ApiStatus>('statuses/update.json', { status, in_reply_to_status_id: inReplyTo, source: 'Meeovi' }) }
  destroy(id: string) { return this.post(`statuses/destroy/${encodeURIComponent(id)}.json`) }
  favorite(id: string) { return this.post(`favorites/create/${encodeURIComponent(id)}.json`) }
  unfavorite(id: string) { return this.post(`favorites/destroy/${encodeURIComponent(id)}.json`) }
  repeat(id: string) { return this.post(`statuses/retweet/${encodeURIComponent(id)}.json`) }
  follow(userId: string) { return this.post('friendships/create.json', { user_id: userId }) }
  unfollow(userId: string) { return this.post('friendships/destroy.json', { user_id: userId }) }
}

function apiError(body: string): string | undefined {
  try {
    const parsed = JSON.parse(body)
    return typeof parsed?.error === 'string' ? parsed.error : undefined
  } catch {
    return undefined
  }
}
