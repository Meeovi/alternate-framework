import { CommerceBackendRegistry } from 'alternate-sdk'
import type { CommerceBackendAdapter } from 'alternate-sdk'
import type { MeeoviTableField, MeeoviTableQuery, MeeoviTableResult, MeeoviTableSource } from '../../runtime/types'

/**
 * Installed adapter-* packages (adapter-magento, ...) register a
 * CommerceBackendAdapter in alternate-sdk's CommerceBackendRegistry from their
 * own Nitro plugin (adapter-magento: runtime/server/commerce-link.ts). Each
 * becomes a table source for the collections it declares, and returns
 * Directus-shaped rows — which is why Directus' field definitions can be the
 * column schema for them.
 *
 * Adapters only answer whole-collection GETs (Magento ignores Directus-style
 * params), so search, sort and paging are applied here, in memory.
 */

const LABELS: Record<string, string> = { magento: 'Magento' }

function label(id: string) {
  return LABELS[id] ?? id.charAt(0).toUpperCase() + id.slice(1)
}

function registered(): CommerceBackendAdapter[] {
  const registry = CommerceBackendRegistry as typeof CommerceBackendRegistry & { list?: () => CommerceBackendAdapter[] }
  return typeof registry.list === 'function' ? registry.list() : []
}

function compare(a: unknown, b: unknown) {
  if (a == null && b == null) return 0
  if (a == null) return 1 // empties last
  if (b == null) return -1
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' })
}

/** Search / sort / paginate an in-memory result set. */
export function queryRows(all: Record<string, unknown>[], query: MeeoviTableQuery): MeeoviTableResult {
  let rows = all
  const term = query.search?.trim().toLowerCase()
  if (term) {
    rows = rows.filter((row) => Object.values(row).some((value) =>
      value != null && typeof value !== 'object' && String(value).toLowerCase().includes(term)))
  }
  if (query.sort) {
    const desc = query.sort.startsWith('-')
    const key = desc ? query.sort.slice(1) : query.sort
    rows = [...rows].sort((a, b) => (desc ? -1 : 1) * compare(a[key], b[key]))
  }
  const start = (query.page - 1) * query.pageSize
  const page = rows.slice(start, start + query.pageSize)
  const fields = query.fields
  return {
    total: rows.length,
    rows: fields?.length ? page.map((row) => Object.fromEntries(fields.filter((f) => f in row).map((f) => [f, row[f]]))) : page,
  }
}

/**
 * Writes to a commerce backend first pass the app's guard, if one is
 * registered under `Symbol.for('mframework.tables.guard')`: it may throw
 * (an h3 error) to refuse, e.g. deleting a store customer that's still
 * linked to an app account.
 */
export interface MeeoviTablesGuard {
  beforeWrite(write: { action: 'create' | 'update' | 'remove', source: string, collection: string, id?: string | number, data?: Record<string, unknown> }): Promise<void> | void
}

async function guard(write: Parameters<MeeoviTablesGuard['beforeWrite']>[0]) {
  const registered = (globalThis as Record<symbol, unknown>)[Symbol.for('mframework.tables.guard')] as MeeoviTablesGuard | undefined
  await registered?.beforeWrite?.(write)
}

/** Adapter errors carry `status`; h3 (and sourceError) read `statusCode`.
 *  The backend refusing the app's own credentials (401/403) isn't the
 *  admin's session, so those stay a 502. */
function withStatus(error: unknown): never {
  const status = (error as { status?: number, statusCode?: number })?.status
  if (status && status !== 401 && status !== 403 && !(error as { statusCode?: number }).statusCode) Object.assign(error as object, { statusCode: status })
  throw error
}

export function adapterSources(): MeeoviTableSource[] {
  return registered().map((adapter) => ({
    id: adapter.id,
    label: label(adapter.id),
    handles(collection: string) {
      try {
        return adapter.isEnabled() && adapter.collections.includes(collection)
      } catch {
        return false
      }
    },
    async list(query: MeeoviTableQuery) {
      const data = await adapter.request({ method: 'GET', collection: query.collection })
      const all = Array.isArray(data) ? data : data ? [data] : []
      return queryRows(all as Record<string, unknown>[], query)
    },
    // Columns and writes, where the adapter offers them (adapter-magento
    // with its Integration: customers are editable; orders and credit
    // memos read-only — refunds have their own flow).
    ...(adapter.schema ? { schema: (collection: string) => adapter.schema!(collection) as Promise<MeeoviTableField[] | null> } : {}),
    ...(adapter.create ? {
      async create(collection: string, data: Record<string, unknown>) {
        await guard({ action: 'create', source: adapter.id, collection, data })
        return adapter.create!(collection, data).catch(withStatus)
      },
    } : {}),
    ...(adapter.update ? {
      async update(collection: string, id: string | number, data: Record<string, unknown>) {
        await guard({ action: 'update', source: adapter.id, collection, id, data })
        return adapter.update!(collection, id, data).catch(withStatus)
      },
    } : {}),
    ...(adapter.remove ? {
      async remove(collection: string, id: string | number) {
        await guard({ action: 'remove', source: adapter.id, collection, id })
        await adapter.remove!(collection, id).catch(withStatus)
      },
    } : {}),
  }))
}
