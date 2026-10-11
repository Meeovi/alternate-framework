import { defineEventHandler, getQuery, getRouterParam, createError } from 'h3'
import type { MeeoviTableField, MeeoviTableResponse } from '../../runtime/types'
import { sourcesFor } from '../sources'
import { directusSchema, secretFields } from '../sources/directus'
import { assertAccess, collectionOptions, tablesConfig } from '../utils/access'

const NAME = /^[A-Za-z0-9_-]{1,64}$/

function int(value: unknown, fallback: number) {
  const n = Math.trunc(Number(value))
  return Number.isFinite(n) && n > 0 ? n : fallback
}

/** Column schema guessed from the rows, when Directus has none. */
function schemaFromRows(rows: Record<string, unknown>[]): MeeoviTableField[] {
  const keys = new Map<string, unknown>()
  for (const row of rows.slice(0, 50)) for (const [k, v] of Object.entries(row)) if (!keys.has(k) || keys.get(k) == null) keys.set(k, v)
  return [...keys].map(([field, sample]) => ({
    field,
    label: field === 'id' ? 'ID' : field.replace(/[_-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    type: typeof sample === 'number' ? 'number'
      : typeof sample === 'boolean' ? 'boolean'
        : sample && typeof sample === 'object' ? 'json'
          : 'string',
    sortable: true,
  }))
}

export default defineEventHandler(async (event): Promise<MeeoviTableResponse> => {
  const collection = getRouterParam(event, 'collection') ?? ''
  if (!NAME.test(collection)) throw createError({ statusCode: 400, statusMessage: 'Invalid table name' })

  const options = collectionOptions(event, collection)
  await assertAccess(event, options)

  const config = tablesConfig(event)
  const q = getQuery(event)
  const page = int(q.page, 1)
  const pageSize = Math.min(int(q.pageSize, config.pageSize), config.maxPageSize)
  const search = typeof q.search === 'string' && q.search.trim() ? q.search.trim().slice(0, 200) : undefined

  const available = await sourcesFor(collection)
  if (!available.length) {
    throw createError({ statusCode: 503, statusMessage: `No data source can serve "${collection}" — install an adapter or configure Directus` })
  }
  const requested = (typeof q.source === 'string' && q.source) || options.source || 'auto'
  const source = requested === 'auto' ? available[0]! : available.find((s) => s.id === requested)
  if (!source) {
    throw createError({ statusCode: 400, statusMessage: `Source "${requested}" can't serve "${collection}" (available: ${available.map((s) => s.id).join(', ')})` })
  }

  // Columns: the source's own schema if it has one, else Directus (the
  // fallback schema — adapters return Directus-shaped rows).
  const secrets = await secretFields(collection)
  let schema = (await source.schema?.(collection)) ?? (await directusSchema(collection))
  const schemaSource: MeeoviTableResponse['schemaSource'] = schema ? 'directus' : 'rows'
  schema = schema?.filter((f) => !secrets.has(f.field)) ?? null

  // Fields actually returned: the configured allowlist, else the schema's
  // (non-relational) fields, else whatever the source returns.
  // Directus answers 403 for any field that doesn't exist, so a configured
  // field missing from the schema is dropped rather than breaking the table.
  const known = schema ? new Set(schema.map((f) => f.field)) : null
  const allow = options.fields?.length
    ? options.fields.filter((f) => !secrets.has(f) && (!known || known.has(f)))
    : undefined
  const fields = allow ?? schema?.map((f) => f.field)

  // Sort only on a returned field ('-field' = descending).
  const rawSort = (typeof q.sort === 'string' && q.sort) || options.sort || ''
  const sortKey = rawSort.replace(/^-/, '')
  const sort = sortKey && (!fields || fields.includes(sortKey)) && NAME.test(sortKey) ? rawSort : undefined

  let result
  try {
    result = await source.list({ collection, page, pageSize, sort, search, fields })
  } catch (error: any) {
    throw createError({ statusCode: 502, statusMessage: `${source.label} couldn't load "${collection}": ${error?.statusMessage || error?.message || 'request failed'}` })
  }

  const rows = result.rows.map((row) => {
    const clean: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(row)) if (!secrets.has(k) && (!allow || allow.includes(k))) clean[k] = v
    return clean
  })

  let columns = schema
  if (columns && allow) columns = columns.filter((f) => allow.includes(f.field))
  // Adapter rows only carry some of the Directus fields — show those.
  if (columns && rows.length && source.id !== 'directus') {
    const present = new Set(rows.flatMap((r) => Object.keys(r)))
    const shown = columns.filter((f) => present.has(f.field))
    columns = shown.length ? shown : null
  }

  return {
    collection,
    label: options.label || collection.replace(/[_-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    source: source.id,
    sources: available.map((s) => ({ id: s.id, label: s.label })),
    schemaSource: columns ? schemaSource : 'rows',
    schema: columns ?? schemaFromRows(rows),
    rows,
    total: result.total,
    page,
    pageSize,
    sort: sort ?? null,
    search: search ?? null,
  }
})
