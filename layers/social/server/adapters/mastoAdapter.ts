import { getSocialConfig } from '../../app/composables/core/config'
import type { FollowPayload, SocialServerAdapter, FollowersResult, FollowingResult, RepostResult } from '../../app/types/social-adapter'

type Json = string | number | boolean | null | Json[] | { [key: string]: Json }

interface AccountsApiLocal {
  follow(id: string): Promise<void>
  unfollow(id: string): Promise<void>
  relationships(ids: string[]): Promise<Array<{ following?: boolean }>>
  followers(id: string, opts?: { limit?: number }): Promise<Array<{ id: string }>>
  following(id: string, opts?: { limit?: number }): Promise<Array<{ id: string }>>
  $select?(id: string): { statuses: { list(opts?: any): Promise<Array<{ id: string }>> } }
}

interface StatusesApiLocal {
  reblog(id: string): Promise<void>
  unreblog(id: string): Promise<void>
  fetch(id: string): Promise<{ id: string; reblogged?: boolean }>
  reblogged_by(id: string, opts?: { limit?: number }): Promise<Array<{ id: string }>>
}

interface MastoClientLocal {
  v1: { accounts: AccountsApiLocal; statuses: StatusesApiLocal }
}

let mastoClientPromise: Promise<MastoClientLocal> | null = null

function isProxyMode(baseUrl?: string) {
  if (!baseUrl) return true
  return baseUrl.startsWith('/') || baseUrl.startsWith('./')
}

async function getMastoClient(): Promise<MastoClientLocal | null> {
  const cfg = getSocialConfig()
  if (!cfg.baseUrl || !cfg.apiKey) return null
  if (!mastoClientPromise) {
    mastoClientPromise = (async () => {
      const mastoMod = await import('masto')
      const factory: Function | undefined = (mastoMod as any).login ?? (mastoMod as any).create ?? (mastoMod as any).default?.login
      if (typeof factory !== 'function') throw new Error('masto factory unavailable')
      const client = await (factory as Function)({ url: cfg.baseUrl!, accessToken: cfg.apiKey! })
      return client as MastoClientLocal
    })()
  }
  return await mastoClientPromise
}

async function proxyRequest<T>(path: string, method = 'GET', body?: Json): Promise<T> {
  const cfg = getSocialConfig()
  const base = cfg.baseUrl || '/api/masto'
  const url = base.replace(/\/$/, '') + path
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (cfg.apiKey) headers.Authorization = `Bearer ${cfg.apiKey}`
  const res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined })
  if (!res.ok) throw new Error(`Proxy request failed (${res.status})`)
  return (await res.json()) as T
}

const adapter: SocialServerAdapter = {
  async follow(payload: FollowPayload): Promise<any | { ok?: boolean }> {
    const cfg = getSocialConfig()
    if (isProxyMode(cfg.baseUrl)) {
      return proxyRequest<any>('/follow', 'POST', payload)
    }
    const client = await getMastoClient()
    if (!client) return { ok: false, error: 'no-masto-client' }
    if (payload.entityType === 'user') {
      await client.v1.accounts.follow(payload.entityId)
      return { ok: true }
    }
    return { ok: false, error: 'unsupported-entity' }
  },

  async unfollow(payload: FollowPayload): Promise<any | { ok?: boolean }> {
    const cfg = getSocialConfig()
    if (isProxyMode(cfg.baseUrl)) {
      return proxyRequest<any>('/follow', 'DELETE', payload)
    }
    const client = await getMastoClient()
    if (!client) return { ok: false, error: 'no-masto-client' }
    if (payload.entityType === 'user') {
      await client.v1.accounts.unfollow(payload.entityId)
      return { ok: true }
    }
    return { ok: false, error: 'unsupported-entity' }
  },

  async isFollowing(payload: { entityType: string; entityId: string; userId?: string }): Promise<boolean | { following: boolean }> {
    const cfg = getSocialConfig()
    if (isProxyMode(cfg.baseUrl)) {
      return proxyRequest<{ following: boolean }>('/follow/exists', 'GET', payload)
    }
    const client = await getMastoClient()
    if (!client) return { following: false }
    if (payload.entityType === 'user') {
      const rel = await client.v1.accounts.relationships([payload.entityId])
      return { following: !!(rel && rel[0] && rel[0].following) }
    }
    return { following: false }
  },

  async getFollowers({ entityType, entityId, limit = 50, offset = 0 }: { entityType: string; entityId: string; limit?: number; offset?: number }): Promise<FollowersResult> {
    const cfg = getSocialConfig()
    if (isProxyMode(cfg.baseUrl)) {
      return proxyRequest<FollowersResult>(`/followers?entityType=${encodeURIComponent(entityType)}&entityId=${encodeURIComponent(entityId)}&limit=${limit}&offset=${offset}`)
    }
    const client = await getMastoClient()
    if (!client) return { total: 0, data: [] }
    if (entityType === 'user') {
      const pager = await client.v1.accounts.followers(entityId, { limit })
      const data = pager.map(a => String(a.id))
      return { total: data.length, data }
    }
    return { total: 0, data: [] }
  },

  async getFollowing({ userId, limit = 50, offset = 0 }: { userId: string; limit?: number; offset?: number }): Promise<FollowingResult> {
    const cfg = getSocialConfig()
    if (isProxyMode(cfg.baseUrl)) {
      return proxyRequest<FollowingResult>(`/following?userId=${encodeURIComponent(userId)}&limit=${limit}&offset=${offset}`)
    }
    const client = await getMastoClient()
    if (!client) return { total: 0, data: [] }
    const pager = await client.v1.accounts.following(userId, { limit })
    const data = pager.map(a => ({ entityType: 'user' as const, entityId: String(a.id) }))
    return { total: data.length, data }
  },

  async repost(payload: { postId: string; userId?: string }): Promise<any | { ok?: boolean }> {
    const cfg = getSocialConfig()
    if (isProxyMode(cfg.baseUrl)) {
      return proxyRequest<any>('/repost', 'POST', payload)
    }
    const client = await getMastoClient()
    if (!client) return { ok: false, error: 'no-masto-client' }
    await client.v1.statuses.reblog(payload.postId)
    return { ok: true }
  },

  async unrepost(payload: { postId: string; userId?: string }): Promise<any | { ok?: boolean }> {
    const cfg = getSocialConfig()
    if (isProxyMode(cfg.baseUrl)) {
      return proxyRequest<any>('/repost', 'DELETE', payload)
    }
    const client = await getMastoClient()
    if (!client) return { ok: false, error: 'no-masto-client' }
    await client.v1.statuses.unreblog(payload.postId)
    return { ok: true }
  },

  async isReposted(payload: { postId: string; userId?: string }): Promise<boolean | { reposted: boolean }> {
    const cfg = getSocialConfig()
    if (isProxyMode(cfg.baseUrl)) {
      return proxyRequest<{ reposted: boolean }>(`/repost/exists?postId=${encodeURIComponent(payload.postId)}${payload.userId ? `&userId=${encodeURIComponent(payload.userId)}` : ''}`)
    }
    const client = await getMastoClient()
    if (!client) return { reposted: false }
    const status = await client.v1.statuses.fetch(payload.postId)
    return { reposted: !!status.reblogged }
  },

  async getReposts({ postId, limit = 50, offset = 0 }: { postId: string; limit?: number; offset?: number }): Promise<RepostResult> {
    const cfg = getSocialConfig()
    if (isProxyMode(cfg.baseUrl)) {
      return proxyRequest<RepostResult>(`/reposts?postId=${encodeURIComponent(postId)}&limit=${limit}&offset=${offset}`)
    }
    const client = await getMastoClient()
    if (!client) return { total: 0, data: [] }
    const pager = await client.v1.statuses.reblogged_by(postId, { limit })
    const data = pager.map(a => String(a.id))
    return { total: data.length, data }
  }
}

export default adapter
