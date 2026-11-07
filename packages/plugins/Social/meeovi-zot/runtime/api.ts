// Hubzilla's (and Streams') own API, api/z/1.0, with HTTP Basic auth — how
// Meeovi acts for a member who connected their channel. Endpoints used:
//   GET  api/z/1.0/verify          the signed-in channel
//   GET  api/z/1.0/network/stream  the channel's network stream (items)
//   POST api/z/1.0/item/update     a new post, or a reply (parent_mid)
// (include/api_zot.php in Hubzilla core.)
import { assertSafeUrl, safeFetch, safeJson } from './safe-fetch'

/** The channel row api/z/1.0/verify returns (joined with its xchan). */
export type ZotChannel = {
  channel_id?: number | string
  channel_name?: string
  channel_address: string
  channel_hash?: string
  xchan_addr?: string
  xchan_url?: string
  xchan_photo_m?: string
  xchan_photo_l?: string
}

/** An item as encode_item() writes it. */
export type ZotItem = {
  message_id: string
  message_top?: string
  message_parent?: string
  created: string
  edited?: string
  title?: string
  summary?: string
  body?: string
  mimetype?: string
  verb?: string
  object_type?: string
  permalink?: string
  author?: ZotXchan
  owner?: ZotXchan
  attach?: { href?: string, type?: string }[] | null
  item_deleted?: number | string
  public_scope?: string
  flags?: string[]
}

export type ZotXchan = { name?: string, address?: string, url?: string, network?: string, photo?: { mimetype?: string, src?: string }, id?: string }

export type ZotCredentials = { hub: string, channel: string, password: string }

/** 'hub.example' or 'https://hub.example/' → 'https://hub.example' (https only). */
export function normalizeHub(hub: string): string {
  const raw = String(hub || '').trim()
  return assertSafeUrl(/^[a-z]+:\/\//i.test(raw) ? raw : `https://${raw}`).origin
}

export class ZotApi {
  private readonly hub: string
  constructor(private readonly creds: ZotCredentials) { this.hub = normalizeHub(creds.hub) }

  get host() { return new URL(this.hub).host }

  private auth() { return { authorization: `Basic ${Buffer.from(`${this.creds.channel}:${this.creds.password}`).toString('base64')}` } }

  async verify(): Promise<ZotChannel> {
    const channel = await safeJson<ZotChannel | false>(`${this.hub}/api/z/1.0/verify`, { headers: this.auth() })
    if (!channel || !channel.channel_address) throw Object.assign(new Error('Not signed in'), { status: 401 })
    return channel
  }

  async networkStream(records: number): Promise<ZotItem[]> {
    const url = new URL(`${this.hub}/api/z/1.0/network/stream`)
    url.searchParams.set('start', '0')
    url.searchParams.set('records', String(records))
    const items = await safeJson<ZotItem[] | false>(url, { headers: this.auth(), maxBytes: 8 * 1024 * 1024 })
    return Array.isArray(items) ? items : []
  }

  async post(body: string, parentMid?: string): Promise<{ success?: boolean | number, message?: string, item?: Record<string, any> }> {
    const form = new URLSearchParams({ body })
    if (parentMid) form.set('parent_mid', parentMid)
    const res = await safeFetch(`${this.hub}/api/z/1.0/item/update`, {
      method: 'POST',
      headers: { ...this.auth(), accept: 'application/json', 'content-type': 'application/x-www-form-urlencoded' },
      body: form,
    })
    if (!res.ok) throw Object.assign(new Error(`${this.host} answered ${res.status}`), { status: res.status })
    const out = JSON.parse(res.text || '{}')
    if (!out?.success) throw new Error(out?.message ? `${this.host}: ${out.message}` : `${this.host} did not save the post`)
    return out
  }
}
