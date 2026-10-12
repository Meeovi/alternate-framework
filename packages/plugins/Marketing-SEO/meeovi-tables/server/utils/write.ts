import { createError, getQuery, getRouterParam, readBody } from 'h3'
import type { H3Event } from 'h3'
import type { MeeoviTableCollectionOptions, MeeoviTableSource } from '../../runtime/types'
import { availableSources, sourceCollection } from '../sources'
import { directusSchema, secretFields } from '../sources/directus'
import { assertEdit, collectionOptions, ownerScope } from './access'

const NAME = /^[A-Za-z0-9_-]{1,64}$/
const ID = /^[A-Za-z0-9_.:-]{1,128}$/

type WriteOp = 'create' | 'update' | 'remove'

/**
 * Common checks for POST / PATCH / DELETE: valid collection, edit
 * permission, and the source to write to — the one the rows are read from
 * (`?source=`, the collection's `source`, else the first available), which
 * must support the operation.
 */
export async function writeTarget(event: H3Event, op: WriteOp): Promise<{
  /** Source collection (the table's `collection` option, else its name). */
  collection: string
  options: MeeoviTableCollectionOptions
  source: MeeoviTableSource
  /** Signed-in user id and display name. */
  userId: string
  userName: string
  /** Rows must belong to this user id (`owner` tables), else null. */
  owner: string | null
}> {
  const table = getRouterParam(event, 'collection') ?? ''
  if (!NAME.test(table)) throw createError({ statusCode: 400, statusMessage: 'Invalid table name' })
  const options = collectionOptions(event, table)
  const user = await assertEdit(event, options)
  const collection = sourceCollection(table, options)

  const available = await availableSources(table, options)
  const q = getQuery(event)
  const requested = (typeof q.source === 'string' && q.source) || options.source || 'auto'
  const source = requested === 'auto' ? available[0] : available.find((s) => s.id === requested)
  if (!source) throw createError({ statusCode: 400, statusMessage: `No source can write to "${collection}"` })
  if (typeof source[op] !== 'function') {
    throw createError({ statusCode: 405, statusMessage: `${source.label} is read-only for "${collection}"` })
  }
  return {
    collection, options, source,
    userId: String(user.id ?? ''),
    userName: String(user.username || user.name || ''),
    owner: ownerScope(options, user),
  }
}

/**
 * On `owner` tables, a user without a bypass role may only touch their own
 * rows (and rows inside the table's fixed `filter`): check before update /
 * delete. Answers 404 rather than 403 so other users' ids aren't probeable.
 */
export async function assertOwnRow(
  collection: string,
  options: MeeoviTableCollectionOptions,
  source: MeeoviTableSource,
  id: string,
  owner: string | null,
): Promise<void> {
  if (owner === null && !options.filter) return
  const schema = (await source.schema?.(collection)) ?? (await directusSchema(collection))
  const pk = schema?.find((f) => f.primary)?.field ?? 'id'
  const parts: Record<string, unknown>[] = [{ [pk]: { _eq: id } }]
  if (owner !== null) parts.push({ [options.owner!]: { _eq: owner } })
  if (options.filter) parts.push(options.filter)
  const found = await source.list({ collection, page: 1, pageSize: 1, fields: [pk], filter: { _and: parts } })
    .catch((error) => { throw sourceError(error, `check ${collection} ${id}`) })
  if (!found.total && !found.rows.length) throw createError({ statusCode: 404, statusMessage: 'Not found' })
}

export function rowId(event: H3Event): string {
  const id = getRouterParam(event, 'id') ?? ''
  if (!ID.test(id)) throw createError({ statusCode: 400, statusMessage: 'Invalid row id' })
  return id
}

/**
 * Keep only fields that exist, are editable (not primary keys / system
 * stamps / Directus read-only), aren't secrets, and are in the collection's
 * `fields` allowlist when it has one. On create, required fields must be set.
 */
export async function editableBody(
  event: H3Event,
  collection: string,
  options: MeeoviTableCollectionOptions,
  source: MeeoviTableSource,
  mode: 'create' | 'update',
): Promise<Record<string, unknown>> {
  const body = await readBody(event).catch(() => null)
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw createError({ statusCode: 400, statusMessage: 'Expected a JSON object of field values' })
  }

  const schema = (await source.schema?.(collection)) ?? (await directusSchema(collection))
  if (!schema) throw createError({ statusCode: 409, statusMessage: `No schema for "${collection}" — can't validate fields to write` })
  const secrets = await secretFields(collection)
  const stamped = new Set([options.owner, options.ownerName, ...(options.readonlyFields ?? [])])
  const editable = schema.filter((f) => !f.readonly && !secrets.has(f.field) && !stamped.has(f.field)
    && (!options.fields?.length || options.fields.includes(f.field)))
  const allowed = new Set(editable.map((f) => f.field))

  const data: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(body as Record<string, unknown>)) {
    if (allowed.has(key)) data[key] = value === '' ? null : value
  }

  if (mode === 'create') {
    const missing = editable.filter((f) => f.required && (data[f.field] == null || data[f.field] === '')).map((f) => f.label)
    if (missing.length) throw createError({ statusCode: 422, statusMessage: `Required: ${missing.join(', ')}` })
  } else if (!Object.keys(data).length) {
    throw createError({ statusCode: 400, statusMessage: 'No editable fields to save' })
  }
  return data
}

/** Directus/adapters errors → a short client-facing message. */
export function sourceError(error: any, action: string) {
  const detail = error?.data?.errors?.[0]?.message || error?.statusMessage || error?.message || 'request failed'
  return createError({ statusCode: error?.statusCode && error.statusCode < 500 ? error.statusCode : 502, statusMessage: `Couldn't ${action}: ${detail}` })
}
