import { getActivitypubClient } from './client'

function normalizeActor(actor: any) {
  if (!actor) return { id: '', username: '', displayName: '', avatarUrl: '', url: '' }
  const id = actor.id || actor.url || ''
  const username = actor.preferredUsername || actor.name || String(id)
  const displayName = actor.name || actor.preferredUsername || ''
  const avatarUrl = actor.icon?.url || actor.image?.url || undefined
  const url = actor.url || id
  return { id, username, displayName, avatarUrl, url }
}

function normalizeActivity(item: any) {
  const obj = item.object || item
  const id = obj.id || obj.url || ''
  const content = obj.content || obj.summary || ''
  const createdAt = obj.published || obj.updated || new Date().toISOString()
  const author = normalizeActor(obj.attributedTo || item.attributedTo || obj.author || item.actor)
  const url = obj.url || id
  return { id, content, createdAt, author, url }
}

export function createActivitypubProviders() {
  const client = getActivitypubClient()

  const provider = {
    async getProfile(handle: string) {
      try {
        if (!client) throw new Error('ActivityPub client not initialized')
        // Try actor endpoint first
        const res = await client(`/actors/${handle}`)
        return normalizeActor(res)
      } catch (e) {
        try {
          const res = await client(`/users/${handle}`)
          return normalizeActor(res)
        } catch (e2) {
          return { id: handle, username: handle }
        }
      }
    },

    async listPosts(handle: string, _opts?: Record<string, any>) {
      try {
        if (!client) return []
        // Attempt actor outbox
        const out = await client(`/actors/${handle}/outbox`)
        const items = out?.orderedItems || out?.items || out || []
        return Array.isArray(items) ? items.map(normalizeActivity) : []
      } catch (e) {
        try {
          const out = await client('/outbox')
          const items = out?.orderedItems || out?.items || out || []
          return Array.isArray(items) ? items.map(normalizeActivity) : []
        } catch (e2) {
          return []
        }
      }
    },

    async createPost(content: string, _opts?: Record<string, any>) {
      if (!client) throw new Error('ActivityPub client not initialized')
      const activity = {
        type: 'Create',
        object: {
          type: 'Note',
          content,
        },
      }
      const res = await client('/outbox', { method: 'POST', body: activity })
      // Response may be the activity or the created object
      return normalizeActivity(res)
    },
  }

  return { socialProvider: provider }
}

export function registerActivitypubProvidersRuntime(
  name: string,
  _options: any,
  registrars: { registerSocialProvider?: (name: string, provider: any) => void } = {},
) {
  const { socialProvider } = createActivitypubProviders()

  try {
    registrars.registerSocialProvider && registrars.registerSocialProvider(name, socialProvider)
  } catch (e) {
    // ignore registration errors
  }

  return { socialProvider }
}

export default createActivitypubProviders
