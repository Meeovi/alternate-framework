// Backend-agnostic content driver contract — lets layers/shared's media
// library, dynamic-schema, and live-content-update composables work
// against whatever CMS backend (Directus, Magento, Vendure, ...) an app
// registers, the same way CommerceBackendRegistry lets layers/commerce
// swap product/order backends without any layers/shared code knowing which
// one is active. A new backend implements ContentAdapter and calls
// ContentAdapterRegistry.register(id, adapter) from its own Nitro plugin —
// nothing in layers/shared ever imports a specific backend's SDK.
import type { MediaItem } from './media.js'

export interface MediaFolder {
  id: string | number
  name: string
  [key: string]: any
}

export interface DynamicSchemaField {
  field?: string
  type?: string
  name?: string
  schema?: {
    data_type?: string
    default_value?: unknown
    is_nullable?: boolean
    foreign_key_table?: string
  }
  meta?: {
    interface?: string
    note?: string
    width?: string
    hidden?: boolean
    required?: boolean
    readonly?: boolean
    options?: Record<string, unknown>
  }
}

export type ContentChangeEventType = 'create' | 'update' | 'delete'

export interface ContentChangeEvent {
  event: ContentChangeEventType
  collection: string
  data: any[]
}

export interface ContentAdapter {
  readonly id: string
  listMedia(params?: { sort?: string[] }): Promise<MediaItem[]>
  listMediaFolders(): Promise<MediaFolder[]>
  uploadMedia(formData: FormData): Promise<MediaItem>
  createMediaFolder(payload: Record<string, any>): Promise<MediaFolder>
  getCollectionSchema(collection: string): Promise<DynamicSchemaField[]>
  /**
   * Subscribes to create/update/delete events on a collection, filtered
   * server-side by `filter`. Returns an unsubscribe function. Server-side
   * only (Nitro route) — the underlying transport (WebSocket, polling, ...)
   * is entirely adapter-specific and never exposed to the caller.
   */
  subscribeToCollection?(
    collection: string,
    filter: Record<string, any>,
    onEvent: (event: ContentChangeEvent) => void,
  ): Promise<() => void>
}

const contentRegistry = new Map<string, ContentAdapter>()
let defaultContentAdapter: ContentAdapter | undefined

export function registerContentAdapter(name: string, adapter: ContentAdapter): void {
  contentRegistry.set(name, adapter)
  // Single active CMS backend per app is the normal case (unlike search/
  // commerce, which can federate several at once) — registering one makes
  // it the default so callers don't need to know its name.
  defaultContentAdapter = adapter
}

export function getContentAdapter(name?: string): ContentAdapter | undefined {
  if (name) return contentRegistry.get(name)
  return defaultContentAdapter
}

export const ContentAdapterRegistry = {
  register: registerContentAdapter,
  get: getContentAdapter,
  getDefaultAdapter: () => defaultContentAdapter,
}
