import { getAtprotoAgent, wrapAgent } from './client'

function normalizeAtprotoProfile(profile: any) {
  if (!profile) return { id: '', username: '' }
  return {
    id: profile.did || profile.handle || profile.id || '',
    username: profile.handle || profile.displayName || profile.name || '',
    displayName: profile.displayName || profile.name || '',
    avatarUrl: profile.avatar || profile.avatarUrl || undefined,
    url: profile.uri || undefined,
  }
}

function normalizeAtprotoPost(item: any) {
  const id = item.cid || item.cidStr || item.id || item.uri || ''
  const content = item.text || item.content || item.body || ''
  const createdAt = item.createdAt || new Date().toISOString()
  const author = normalizeAtprotoProfile(item.author || item.creator || item.account || {})
  return { id, content, createdAt, author, url: item.uri || undefined }
}

export function createAtprotoProviders() {
  const agent = getAtprotoAgent()
  const client = agent && agent.login ? wrapAgent(agent) : agent

  const provider = {
    async getProfile(handle: string) {
      try {
        if (!client) return { id: handle, username: handle }
        if (typeof client.getProfile === 'function') {
          const res = await client.getProfile({ handle })
          return normalizeAtprotoProfile(res?.data || res)
        }
        return { id: handle, username: handle }
      } catch (e) {
        return { id: handle, username: handle }
      }
    },

    async listPosts(handle: string, opts?: Record<string, any>) {
      try {
        if (!client) return []
        if (typeof client.getTimeline === 'function') {
          const res = await client.getTimeline({ limit: opts?.limit || 20 })
          const items = res?.data?.feed || res
          return Array.isArray(items) ? items.map(normalizeAtprotoPost) : []
        }
        return []
      } catch (e) {
        return []
      }
    },

    async createPost(content: string, _opts?: Record<string, any>) {
      if (!client) throw new Error('Atproto client not initialized')
      if (typeof client.post === 'function') {
        const res = await client.post({ text: content })
        return normalizeAtprotoPost(res?.data || res)
      }
      throw new Error('createPost not supported by client')
    },
  }

  return { socialProvider: provider }
}

export function registerAtprotoProvidersRuntime(
  name: string,
  _options: any,
  registrars: { registerSocialProvider?: (name: string, provider: any) => void } = {},
) {
  const { socialProvider } = createAtprotoProviders()
  try {
    registrars.registerSocialProvider && registrars.registerSocialProvider(name, socialProvider)
  } catch (e) {
    // ignore
  }
  return { socialProvider }
}

export default createAtprotoProviders
