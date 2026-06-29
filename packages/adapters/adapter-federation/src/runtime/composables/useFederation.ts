// modules/alternate-federation/runtime/useFederation.ts

import { shallowRef } from 'vue'
import type { mastodon } from '../../clients/mastodon'
import {
  createMastodonSessionClients,
  isMastoHttpErrorStatus,
  normalizeLegacyV1InstanceToV2,
} from '../../clients/mastodon'

export interface FederationSessionUser {
  server: string
  token: string
}

export interface FederationMastoState {
  client: ReturnType<typeof shallowRef<mastodon.rest.Client>>
  streamingClient: ReturnType<typeof shallowRef<mastodon.streaming.Client | undefined>>
}

export function createFederationState(): FederationMastoState {
  return {
    client: shallowRef<mastodon.rest.Client>(undefined as never),
    streamingClient: shallowRef<mastodon.streaming.Client | undefined>(),
  }
}

export async function loginMastodonSession(options: {
  masto: FederationMastoState
  user: FederationSessionUser
  getInstanceCache: (server: string) => mastodon.v2.Instance | undefined
  instanceStorage: { value: Record<string, mastodon.v2.Instance> }
  currentUser: { value: unknown }
  webSocketImplementation?: unknown
}) {
  const { masto, user } = options
  const server = user.server
  const url = `https://${server}`
  const accessToken = user.token

  const instance =
    options.getInstanceCache(server) ||
    ({
      uri: server,
      accountDomain: server,
    } as any)

  const streamingApiUrl = instance?.configuration?.urls?.streaming

  const clients = createMastodonSessionClients({
    url,
    accessToken,
    streamingApiUrl,
    enableStreaming: Boolean(streamingApiUrl && options.currentUser.value),
    webSocketImplementation: options.webSocketImplementation,
  })

  masto.client.value = clients.client
  masto.streamingClient.value = clients.streamingClient

  try {
    const newInstance = await masto.client.value.v2.instance.fetch()
    Object.assign(instance, newInstance)
    options.instanceStorage.value[server] = newInstance
  } catch (error) {
    if (isMastoHttpErrorStatus(error, 404)) {
      const legacy = await masto.client.value.v1.instance.fetch()
      const normalized = normalizeLegacyV1InstanceToV2(legacy)
      Object.assign(instance, normalized)
      options.instanceStorage.value[server] = normalized
    } else {
      throw error
    }
  }

  return instance as mastodon.v2.Instance
}

// ---------------------------------------------------------
// FEDERATION API (RAW MASTODON)
// ---------------------------------------------------------

export function useFederation(masto: FederationMastoState) {
  const getClient = (): mastodon.rest.Client => {
    const c = masto.client.value
    if (!c) throw new Error('Federation client not initialized')
    return c
  }

  // -----------------------------------------------------
  // GET POSTS (public timeline or hashtag)
  // -----------------------------------------------------
  const getRawPosts = async (opts?: {
    hashtag?: string
    limit?: number
  }): Promise<mastodon.v1.Status[]> => {
    const c = getClient()

    if (opts?.hashtag) {
      return c.v1.timelines.tag.$select(opts.hashtag).list({
        limit: opts.limit || 20,
      })
    }

    return c.v1.timelines.public.list({
      limit: opts?.limit || 20,
    })
  }

  // -----------------------------------------------------
  // GET USER FEED
  // -----------------------------------------------------
  const getRawUserFeed = async (opts: {
    userHandle: string
    limit?: number
  }): Promise<mastodon.v1.Status[]> => {
    const c = getClient()

    const acct = opts.userHandle
    const account = await c.v1.accounts.lookup({ acct })

    return c.v1.accounts.$select(account.id).statuses.list({
      limit: opts.limit || 20,
    })
  }

  // -----------------------------------------------------
  // CREATE POST
  // -----------------------------------------------------
  const createRawPost = async (payload: {
    content: string
    visibility: mastodon.v1.StatusVisibility
    hashtags?: string[]
  }): Promise<mastodon.v1.Status> => {
    const c = getClient()

    const content =
      payload.hashtags && payload.hashtags.length
        ? `${payload.content}\n\n${payload.hashtags.map(h => `#${h}`).join(' ')}`
        : payload.content

    return c.v1.statuses.create({
      status: content,
      visibility: payload.visibility
    })
  }

  return {
    getRawPosts,
    getRawUserFeed,
    createRawPost
  }
}
