// Real ContentAdapter implementation backed by Directus. Registered into
// alternate-sdk's ContentAdapterRegistry (see runtime/server/register-
// content-adapter.ts) so layers/shared's media/schema/live-update
// composables can go through the generic contract instead of importing
// @directus/sdk directly — a future adapter-magento or adapter-vendure
// content driver plugs into the exact same registry.
import {
  createDirectus,
  rest,
  realtime,
  authentication,
  staticToken,
  readItems,
  createItem,
  readFieldsByCollection,
  uploadFiles,
} from '@directus/sdk'
import type { ContentAdapter, ContentChangeEvent, DynamicSchemaField, MediaFolder } from 'alternate-sdk'
import type { MediaItem } from 'alternate-sdk/contracts'

// Field selections here intentionally match what the composables this
// adapter serves actually consumed before the rewrite (useMediaCenter.ts /
// useDynamicSchema.ts), not a generic "select everything" — Directus
// collections in this app aren't schema-locked to a fixed shape, so we
// read broadly ('*' equivalents) and let the caller filter client-side,
// same as the original direct-SDK code did.

export function createDirectusContentAdapter(baseUrl: string, token?: string): ContentAdapter {
  const client = createDirectus(baseUrl)
    .with(rest())
    .with(staticToken(token || ''))

  const toArray = (result: unknown): any[] => (Array.isArray(result) ? result : [])

  return {
    id: 'directus',

    async listMedia(params) {
      const result = await client.request(
        readItems('media', { sort: params?.sort ?? ['-date_created'] }),
      )
      return toArray(result) as MediaItem[]
    },

    async listMediaFolders() {
      const result = await client.request(readItems('media_folders', { sort: ['sort', 'name'] }))
      return toArray(result) as MediaFolder[]
    },

    async uploadMedia(formData) {
      const result = await client.request(uploadFiles(formData))
      return result as MediaItem
    },

    async createMediaFolder(payload) {
      const result = await client.request(createItem('media_folders', payload))
      return result as MediaFolder
    },

    async getCollectionSchema(collection) {
      const result = await client.request(readFieldsByCollection(collection))
      return toArray(result) as DynamicSchemaField[]
    },

    async subscribeToCollection(collection, filter, onEvent) {
      // A dedicated realtime client — separate from the REST client above,
      // since .with(realtime()) opens a persistent WebSocket rather than
      // making per-request calls. Uses the same authentication() composable
      // the pre-adapter code used; a static token has no WebSocket-auth
      // equivalent in Directus's realtime protocol, so this only receives
      // events for public-permission collections unless a real login
      // session exists — an existing limitation carried over as-is, not
      // introduced by this rewrite.
      const realtimeClient = createDirectus(baseUrl)
        .with(authentication('json', { autoRefresh: true }))
        .with(realtime())

      let stopped = false
      let unsubscribeFn: (() => void) | null = null

      const run = async () => {
        try {
          const { subscription, unsubscribe } = await realtimeClient.subscribe(collection, {
            event: 'update',
            query: { fields: ['*'], filter },
          })
          unsubscribeFn = unsubscribe

          for await (const message of subscription) {
            if (stopped) break
            if (!message) continue

            if (message.event === 'error') {
              console.error(`[adapter-directus] realtime subscription to "${collection}" received an error event:`, message.error)
              continue
            }

            // 'init' (the initial snapshot sent right when a subscription
            // opens) carries the same { data } shape as 'update' — treated
            // the same way since ContentChangeEvent has no separate case
            // for it.
            onEvent({
              event: message.event === 'init' ? 'update' : message.event,
              collection,
              data: Array.isArray(message.data) ? message.data : [message.data].filter(Boolean),
            })
          }
        } catch (error) {
          console.error(`[adapter-directus] realtime subscription to "${collection}" failed:`, error)
        }
      }

      realtimeClient.connect().then(run).catch((error) => {
        console.error('[adapter-directus] realtime connect failed:', error)
      })

      return () => {
        stopped = true
        unsubscribeFn?.()
        try {
          realtimeClient.disconnect()
        } catch {
          // already disconnected
        }
      }
    },
  }
}
