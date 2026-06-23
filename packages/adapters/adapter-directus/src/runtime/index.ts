import { createDirectus, rest, staticToken, readItem, readItems, readFieldsByCollection, createItem, updateItem, deleteItem, uploadFiles, readSingleton } from '@directus/sdk'

export const directus = createDirectus('')

export function createMeeoviDirectusClient<Schema = any>(url: string) {
  return createDirectus<Schema>(url).with(rest())
}

export * from './schema/types'
export * from './schema/introspect'

export type { DirectusSchema } from './schema/types'

export * from './utils/fields'

export * from './generators/form-engine'
export * from './generators/table-engine'
export * from './generators/validation-engine'
export * from './generators/widget-registry'

export * from './utils/visualEditing'
export * from './utils/livePreview'
export * from './composables'

export {
    createDirectus,
    rest,
    authentication,
    readItem,
    readMe,
    readItems,
    createItem,
    updateItem,
    deleteItem,
    uploadFiles,
    readSingleton,
    readFieldsByCollection
} from '@directus/sdk';

export interface DirectusAdapterOptions {
    url?: string
    staticToken?: string
}

function normalizeDirectusLegacyResult(value: any): any {
    if (Array.isArray(value)) return value.map(normalizeDirectusLegacyResult)
    if (!value || typeof value !== 'object') return value
    const normalized: Record<string, any> = {}
    for (const [key, entry] of Object.entries(value)) {
        normalized[key] = normalizeDirectusLegacyResult(entry)
    }
    if (normalized.directus_files_id && !normalized.file) {
        normalized.file = normalized.directus_files_id
    }
    if (normalized.directus_users_id && !normalized.user) {
        normalized.user = normalized.directus_users_id
    }
    if (normalized.directus_users && !normalized.user) {
        normalized.user = normalized.directus_users
    }
    return normalized
}

function expandDirectusLegacyFields(value: any): any {
    if (Array.isArray(value)) {
        return value.flatMap((entry: any) => {
            const expanded = expandDirectusLegacyFields(entry)
            return Array.isArray(expanded) ? expanded : [expanded]
        })
    }
    if (!value || typeof value !== 'object') {
        if (typeof value === 'string' && value.includes('file')) {
            const legacyValue = value.replace(/(^|\.)file(\.|$)/g, '$1directus_files_id$2')
            return legacyValue === value ? value : [value, legacyValue]
        }
        if (typeof value === 'string' && value.includes('user')) {
            const legacyValue = value.replace(/(^|\.)user(\.|$)/g, '$1directus_users_id$2')
            return legacyValue === value ? value : [value, legacyValue]
        }
        return value
    }
    const normalized: Record<string, any> = {}
    for (const [key, entry] of Object.entries(value)) {
        const nextKey = key === 'file' ? 'directus_files_id' : key
        normalized[nextKey] = expandDirectusLegacyFields(entry)
    }
    return normalized
}

function normalizeDirectusLegacyPayload(data: any): any {
    if (Array.isArray(data)) return data.map(normalizeDirectusLegacyPayload)
    if (!data || typeof data !== 'object') return data
    const normalized: Record<string, any> = {}
    for (const [key, entry] of Object.entries(data)) {
        const nextKey = key === 'file'
            ? 'directus_files_id'
            : key === 'user'
                ? 'directus_users_id'
                : key
        normalized[nextKey] = normalizeDirectusLegacyPayload(entry)
    }
    return normalized
}

export function normalizeDirectusReadOptions(opts: any) {
    if (!opts) return opts
    return expandDirectusLegacyFields(opts)
}

export function normalizeDirectusWritePayload(payload: any) {
    return normalizeDirectusLegacyPayload(payload)
}

export function normalizeDirectusResult(result: any) {
    return normalizeDirectusLegacyResult(result)
}

export interface DescribeDirectusContentErrorOptions {
    label?: string
    directusUrl?: string
}

export function describeDirectusContentError(error: any, options: DescribeDirectusContentErrorOptions = {}) {
    const label = options.label || 'content'
    const message = String(error?.data?.message || error?.statusMessage || error?.message || '').trim()

    if (/503|service unavailable/i.test(message)) {
        const host = options.directusUrl || 'Directus'
        return `Directus content is currently unavailable from ${host}.`
    }

    if (message) {
        return `Unable to load ${label}: ${message}`
    }

    return `Unable to load ${label} from Directus.`
}

/**
 * Runtime adapter contract used by app plugins and adapter-loader.
 * Falls back to env-provided Directus URL when options are omitted.
 */
export class DirectusAdapter {
    private readonly url: string
    private readonly sdk: ReturnType<typeof createMeeoviDirectusClient<any>>
    private readonly client: any

    constructor(options: DirectusAdapterOptions = {}) {
        this.url = String(options.url || (import.meta as any)?.env?.DIRECTUS_URL || '')
        this.sdk = createMeeoviDirectusClient<any>(this.url)
        this.client = options.staticToken
            ? (this.sdk as any).with(staticToken(options.staticToken))
            : this.sdk
    }

    request(query: any) {
        return this.client.request(query)
    }

    async readItems(collection: string, opts?: any) {
        const op = (readItems as any)(collection, normalizeDirectusReadOptions(opts))
        const result = await this.client.request(op)
        return normalizeDirectusResult(result)
    }

    async readItem(collection: string, id: string | number, opts?: any) {
        const op = (readItem as any)(collection, id, normalizeDirectusReadOptions(opts))
        const result = await this.client.request(op)
        return normalizeDirectusResult(result)
    }

    async readFieldsByCollection(collection: string, opts?: any) {
        const op = (readFieldsByCollection as any)(collection, normalizeDirectusReadOptions(opts))
        const result = await this.client.request(op)
        return normalizeDirectusResult(result)
    }

    async createItem(collection: string, payload: any) {
        const op = (createItem as any)(collection, normalizeDirectusWritePayload(payload))
        const result = await this.client.request(op)
        return normalizeDirectusResult(result)
    }

    async updateItem(collection: string, id: string | number, payload?: any) {
        const op = (updateItem as any)(collection, id, normalizeDirectusWritePayload(payload))
        const result = await this.client.request(op)
        return normalizeDirectusResult(result)
    }

    deleteItem(collection: string, id: string | number) {
        const op = (deleteItem as any)(collection, id)
        return this.client.request(op)
    }

    uploadFiles(files: any) {
        return this.client.request((uploadFiles as any)(files))
    }

    getSchema(collection: string) {
        return this.readFieldsByCollection(collection)
    }

    getItem(collection: string, id: string | number, opts?: any) {
        return this.readItem(collection, id, opts)
    }

    getAssetUrl(file: any) {
        const fid = file?.id || file?.directus_files_id?.id || file?.filename_disk || file
        if (!fid || !this.url) return ''
        return `${this.url.replace(/\/$/, '')}/assets/${fid}`
    }
}

export const createGatewayAdapterBindings = (options: DirectusAdapterOptions = {}) => ({
    content: {
        directus: new DirectusAdapter(options),
    },
})