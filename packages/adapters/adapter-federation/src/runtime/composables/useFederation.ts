import { reactive, shallowRef } from 'vue'
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

export interface LoginMastodonSessionOptions {
  masto: FederationMastoState
  user: FederationSessionUser
  getInstanceCache: (server: string) => mastodon.v2.Instance | undefined
  instanceStorage: { value: Record<string, mastodon.v2.Instance> }
  currentUser: { value: unknown }
  webSocketImplementation?: unknown
}

export function createFederationState(): FederationMastoState {
  return {
    client: shallowRef<mastodon.rest.Client>(undefined as never),
    streamingClient: shallowRef<mastodon.streaming.Client | undefined>(),
  }
}

export function loginMastodonSession(options: LoginMastodonSessionOptions) {
  const server = options.user.server
  const url = `https://${server}`
  const accessToken = options.user.token

  const instance = reactive(options.getInstanceCache(server) || {
    uri: server,
    accountDomain: server,
  }) as any

  const streamingApiUrl = instance?.configuration?.urls?.streaming
  const clients = createMastodonSessionClients({
    url,
    accessToken,
    streamingApiUrl,
    enableStreaming: Boolean(streamingApiUrl && options.currentUser.value),
    webSocketImplementation: options.webSocketImplementation,
  })

  options.masto.client.value = clients.client
  options.masto.streamingClient.value = clients.streamingClient

  options.masto.client.value.v2.instance.fetch().catch(error => new Promise<mastodon.v2.Instance>((resolve, reject) => {
    if (isMastoHttpErrorStatus(error, 404)) {
      return options.masto.client.value.v1.instance.fetch().then((newInstance) => {
        console.warn(`Instance ${server} on version ${newInstance.version} does not support \"GET /api/v2/instance\" API, try converting to v2 instance... expect some errors`)
        return resolve(normalizeLegacyV1InstanceToV2(newInstance))
      }).catch(reject)
    }

    return reject(error)
  })).then((newInstance) => {
    Object.assign(instance, newInstance)

    if (newInstance.configuration.urls.streaming !== streamingApiUrl) {
      const updated = createMastodonSessionClients({
        url,
        accessToken,
        streamingApiUrl: newInstance.configuration.urls.streaming,
        enableStreaming: Boolean(newInstance.configuration.urls.streaming && options.currentUser.value),
        webSocketImplementation: options.webSocketImplementation,
      })
      options.masto.streamingClient.value = updated.streamingClient
    }

    options.instanceStorage.value[server] = newInstance
  })

  return instance as mastodon.v2.Instance
}
