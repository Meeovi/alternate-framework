import type { MeeoviTableField, MeeoviTableQuery, MeeoviTableResult, MeeoviTableSource } from '../../runtime/types'

/**
 * Directus — the fallback data source and the schema source for every table.
 * Adapters (adapter-magento, ...) return Directus-shaped rows, so the
 * collection's Directus field definitions describe their columns too.
 */

type DirectusField = {
  field: string
  type: string
  meta?: {
    interface?: string | null
    special?: string[] | null
    hidden?: boolean
    width?: string | null
    sort?: number | null
    options?: { choices?: Array<{ text?: string, value: string | number }> } | null
    readonly?: boolean
    required?: boolean
  } | null
  schema?: { is_primary_key?: boolean, has_auto_increment?: boolean, is_nullable?: boolean } | null
}

/** Directus fills these itself — never editable from a table. */
const SYSTEM_SPECIALS = ['date-created', 'date-updated', 'user-created', 'user-updated']

const SCHEMA_TTL_MS = 5 * 60 * 1000
const schemaCache = new Map<string, { at: number, fields: DirectusField[] | null }>()

function config() {
  const runtime = useRuntimeConfig() as Record<string, any>
  const own = runtime.meeoviTables?.directus ?? {}
  return {
    // Module options first, then what layers/commerce / the app already set.
    url: String(own.url || runtime.public?.directus?.url || '').replace(/\/+$/, ''),
    token: String(own.token || runtime.directus?.token || ''),
  }
}

function headers(token: string) {
  return token ? { Authorization: `Bearer ${token}` } : undefined
}

/** Directus field types / special flags → table column type. */
function fieldType(f: DirectusField): MeeoviTableField['type'] {
  switch (f.type) {
    case 'string': case 'csv': case 'hash': return 'string'
    case 'text': return 'text'
    case 'integer': case 'bigInteger': case 'float': case 'decimal': return 'number'
    case 'boolean': return 'boolean'
    case 'date': return 'date'
    case 'dateTime': case 'timestamp': return 'datetime'
    case 'time': return 'string'
    case 'json': return 'json'
    case 'uuid': return 'uuid'
    default: return 'unknown'
  }
}

function humanize(field: string) {
  return field.replace(/[_-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

/** Fields that never belong in a table: relations' virtual aliases,
 *  presentation-only fields, and secrets. */
export function isHiddenByType(f: DirectusField) {
  const special = f.meta?.special ?? []
  if (f.type === 'alias') return true // o2m / m2m / presentation dividers
  if (f.type === 'hash' || special.includes('hash') || special.includes('conceal')) return true
  return false
}

export function toTableFields(fields: DirectusField[]): MeeoviTableField[] {
  return fields
    .filter((f) => !isHiddenByType(f))
    .sort((a, b) => (a.meta?.sort ?? 999) - (b.meta?.sort ?? 999))
    .map((f) => {
      const choices = f.meta?.options?.choices
      return {
        field: f.field,
        label: f.field === 'id' ? 'ID' : humanize(f.field),
        type: fieldType(f),
        choices: Array.isArray(choices) && choices.length
          ? choices.map((c) => ({ id: c.value, label: String(c.text ?? c.value) }))
          : undefined,
        hidden: Boolean(f.meta?.hidden),
        narrow: f.meta?.width === 'half',
        sortable: true,
        primary: Boolean(f.schema?.is_primary_key),
        readonly: Boolean(f.schema?.is_primary_key || f.meta?.readonly
          || (f.meta?.special ?? []).some((sp) => SYSTEM_SPECIALS.includes(sp))),
        required: Boolean(f.meta?.required),
      }
    })
}

/** Raw Directus field definitions for a collection (cached), or null when
 *  Directus has no such collection / we may not read its schema. */
async function rawFields(collection: string): Promise<DirectusField[] | null> {
  const hit = schemaCache.get(collection)
  if (hit && Date.now() - hit.at < SCHEMA_TTL_MS) return hit.fields
  const { url, token } = config()
  if (!url) return null
  let fields: DirectusField[] | null = null
  try {
    const res = await $fetch<{ data: DirectusField[] }>(`${url}/fields/${encodeURIComponent(collection)}`, { headers: headers(token) })
    fields = res.data ?? []
  } catch {
    fields = null
  }
  schemaCache.set(collection, { at: Date.now(), fields })
  return fields
}

/** Column schema from Directus — null lets the API derive columns from rows. */
export async function directusSchema(collection: string): Promise<MeeoviTableField[] | null> {
  const fields = await rawFields(collection)
  return fields ? toTableFields(fields) : null
}

/** Password / concealed fields — stripped from every row, whatever the source. */
export async function secretFields(collection: string): Promise<Set<string>> {
  const fields = await rawFields(collection)
  return new Set((fields ?? [])
    .filter((f) => f.type === 'hash' || (f.meta?.special ?? []).some((s) => s === 'hash' || s === 'conceal'))
    .map((f) => f.field))
}

export const directusSource: MeeoviTableSource = {
  id: 'directus',
  label: 'Directus',
  filters: true,

  handles() {
    return Boolean(config().url)
  },

  async list(query: MeeoviTableQuery): Promise<MeeoviTableResult> {
    const { url, token } = config()
    const params: Record<string, string | number> = {
      limit: query.pageSize,
      offset: (query.page - 1) * query.pageSize,
      meta: 'filter_count',
    }
    if (query.fields?.length) params.fields = query.fields.join(',')
    if (query.sort) params.sort = query.sort
    if (query.search) params.search = query.search
    if (query.filter) params.filter = JSON.stringify(query.filter)

    const res = await $fetch<{ data: Record<string, unknown>[], meta?: { filter_count?: number } }>(
      `${url}/items/${encodeURIComponent(query.collection)}`,
      { headers: headers(token), query: params },
    )
    const rows = res.data ?? []
    return { rows, total: res.meta?.filter_count ?? rows.length }
  },

  schema: directusSchema,

  async create(collection, data) {
    const { url, token } = config()
    const res = await $fetch<{ data: Record<string, unknown> }>(`${url}/items/${encodeURIComponent(collection)}`, {
      method: 'POST', headers: headers(token), body: data,
    })
    return res.data
  },

  async update(collection, id, data) {
    const { url, token } = config()
    const res = await $fetch<{ data: Record<string, unknown> }>(`${url}/items/${encodeURIComponent(collection)}/${encodeURIComponent(String(id))}`, {
      method: 'PATCH', headers: headers(token), body: data,
    })
    return res.data
  },

  async remove(collection, id) {
    const { url, token } = config()
    await $fetch(`${url}/items/${encodeURIComponent(collection)}/${encodeURIComponent(String(id))}`, {
      method: 'DELETE', headers: headers(token),
    })
  },
}
