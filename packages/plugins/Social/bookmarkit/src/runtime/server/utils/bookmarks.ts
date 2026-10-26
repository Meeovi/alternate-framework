import { randomBytes } from 'node:crypto'
import { createError, getRequestHeader, getRouterParam } from 'h3'
import type { H3Event } from 'h3'
import type { Bookmark, BookmarkFolder } from '../../types'

/**
 * Bookmarks live in Directus as lists: a folder is one of the user's
 * `lists` of type "Bookmarks" (owner through the lists_directus_users
 * junction, type through lists_type_lists), and a bookmark is a `list_items`
 * row in it (title, link, description). Ownership always comes from the
 * session; every id in a request is checked against the user's own folders.
 */

type Config = { listType: string, sessionEndpoint: string, directus: { url: string, token: string } }

const clean = (value: unknown) => String(value ?? '').trim().replace(/^(['"])(.*)\1$/, '$2')

export function bookmarkitConfig(event?: H3Event): Config {
  const own = (useRuntimeConfig(event) as Record<string, any>).bookmarkit ?? {}
  return {
    listType: own.listType || 'Bookmarks',
    sessionEndpoint: own.sessionEndpoint || '/api/auth/get-session',
    directus: {
      url: (clean(own.directus?.url) || clean(process.env.DIRECTUS_URL)).replace(/\/+$/, ''),
      token: clean(own.directus?.token) || clean(process.env.NUXTUS_DIRECTUS_STATIC_TOKEN),
    },
  }
}

export function directus(event?: H3Event) {
  const { directus: { url, token } } = bookmarkitConfig(event)
  if (!url) throw createError({ statusCode: 503, statusMessage: 'Bookmarks are not configured' })
  return <T = any>(path: string, options: Record<string, any> = {}) =>
    $fetch<T>(`${url}${path}`, {
      timeout: 15000,
      ...options,
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
    } as any) as Promise<T>
}

export async function requireUser(event: H3Event): Promise<{ id: string }> {
  const cookie = getRequestHeader(event, 'cookie')
  if (cookie) {
    try {
      const session = await $fetch<{ user?: { id?: string } } | null>(bookmarkitConfig(event).sessionEndpoint, { headers: { cookie } })
      if (session?.user?.id) return { id: String(session.user.id) }
    } catch { /* treated as signed out */ }
  }
  throw createError({ statusCode: 401, statusMessage: 'Sign in to use bookmarks' })
}

// ---------------------------------------------------------------------------
// Input

const MAX = { title: 200, description: 1000, url: 2048, name: 80 }

function text(value: unknown, max: number, label: string): string {
  if (value === undefined || value === null) return ''
  if (typeof value !== 'string') throw createError({ statusCode: 400, statusMessage: `${label} must be text` })
  const out = value.trim()
  if (out.length > max) throw createError({ statusCode: 400, statusMessage: `${label} is longer than ${max} characters` })
  return out
}

/** Only http(s) links: a javascript: or data: URL would run when clicked. */
export function readUrl(value: unknown): string {
  const raw = text(value, MAX.url, 'URL')
  let url: URL
  try {
    url = new URL(/^[a-z][a-z\d+.-]*:/i.test(raw) ? raw : `https://${raw}`)
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Enter a valid web address' })
  }
  if (!['http:', 'https:'].includes(url.protocol) || !url.hostname.includes('.')) {
    throw createError({ statusCode: 400, statusMessage: 'Enter a valid web address' })
  }
  return url.toString()
}

export const readTitle = (value: unknown) => text(value, MAX.title, 'Title')
export const readDescription = (value: unknown) => text(value, MAX.description, 'Description')

export function readFolder(body: Record<string, unknown> | null | undefined, partial = false) {
  const name = text(body?.name, MAX.name, 'Name')
  if (!name && !partial) throw createError({ statusCode: 400, statusMessage: 'Name is required' })
  return {
    ...(name ? { name } : {}),
    ...(body?.description !== undefined ? { description: readDescription(body.description) } : {}),
  }
}

export function readId(value: unknown): number {
  const id = Number(value)
  if (!Number.isSafeInteger(id) || id < 1) throw createError({ statusCode: 400, statusMessage: 'Invalid id' })
  return id
}

export const routeId = (event: H3Event) => readId(getRouterParam(event, 'id'))

// ---------------------------------------------------------------------------
// Folders

type ListRow = { id: number | string, name?: string | null, description?: string | null }
type ItemRow = { id: number | string, title?: string | null, link?: string | null, description?: string | null, list_id?: number | string | null, date_created?: string | null }

const ownFilter = (event: H3Event, userId: string) => ({
  user: { user_id: { _eq: userId } },
  lists_type: { lists_type_id: { name: { _eq: bookmarkitConfig(event).listType } } },
})

export async function listFolders(event: H3Event, userId: string): Promise<BookmarkFolder[]> {
  const { data } = await directus(event)<{ data: ListRow[] }>('/items/lists', {
    query: { fields: 'id,name,description', filter: JSON.stringify(ownFilter(event, userId)), sort: 'date_created', limit: -1 },
  })
  return (data ?? []).map((row) => ({ id: Number(row.id), name: row.name || 'Bookmarks', description: row.description || '', count: 0 }))
}

export async function requireFolder(event: H3Event, userId: string, folderId: number): Promise<BookmarkFolder> {
  const folder = (await listFolders(event, userId)).find((f) => f.id === folderId)
  if (!folder) throw createError({ statusCode: 404, statusMessage: 'Folder not found' })
  return folder
}

const typeIds = new Map<string, number>()
async function listTypeId(event: H3Event): Promise<number> {
  const name = bookmarkitConfig(event).listType
  const cached = typeIds.get(name)
  if (cached) return cached
  const { data } = await directus(event)<{ data: ListRow[] }>('/items/lists_type', {
    query: { fields: 'id', filter: JSON.stringify({ name: { _eq: name } }), limit: 1 },
  })
  if (!data?.[0]) throw createError({ statusCode: 503, statusMessage: `The "${name}" list type is missing in Directus` })
  typeIds.set(name, Number(data[0].id))
  return typeIds.get(name)!
}

// Directus only makes slugs in its admin UI; a list without one links to
// /lists/list/undefined.
const slugFor = (name: string) =>
  `${name.toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_-]+/g, '-').slice(0, 60) || 'bookmarks'}-${randomBytes(3).toString('hex')}`

export async function createFolder(event: H3Event, userId: string, input: { name?: string, description?: string }): Promise<BookmarkFolder> {
  const name = input.name || 'Bookmarks'
  const { data } = await directus(event)<{ data: ListRow }>('/items/lists', {
    method: 'POST',
    body: {
      name,
      slug: slugFor(name),
      type: 'bookmarks',
      status: 'Private',
      ...(input.description ? { description: input.description } : {}),
      user: { create: [{ user_id: userId }], update: [], delete: [] },
      lists_type: { create: [{ lists_type_id: await listTypeId(event) }], update: [], delete: [] },
    },
    query: { fields: 'id,name,description' },
  })
  return { id: Number(data.id), name: data.name || name, description: data.description || '', count: 0 }
}

/** Removes the folder's bookmarks and link rows first: deleting a list only nulls them. */
export async function deleteFolder(event: H3Event, folderId: number): Promise<void> {
  const api = directus(event)
  const ids = async (collection: string, field: string) =>
    ((await api<{ data: ListRow[] }>(`/items/${collection}`, {
      query: { fields: 'id', filter: JSON.stringify({ [field]: { _eq: folderId } }), limit: -1 },
    })).data ?? []).map((row) => row.id)
  for (const [collection, field] of [['list_items', 'list_id'], ['lists_directus_users', 'list_id'], ['lists_type_lists', 'lists_id']] as const) {
    const keys = await ids(collection, field)
    if (keys.length) await api(`/items/${collection}`, { method: 'DELETE', body: keys })
  }
  await api(`/items/lists/${folderId}`, { method: 'DELETE' })
}

// ---------------------------------------------------------------------------
// Bookmarks

const ITEM_FIELDS = 'id,title,link,description,list_id,date_created'

export const toBookmark = (row: ItemRow): Bookmark => ({
  id: Number(row.id),
  title: row.title || '',
  url: row.link || '',
  description: row.description || '',
  folderId: Number(row.list_id),
  createdAt: row.date_created ?? null,
})

export async function listBookmarks(event: H3Event, folderIds: number[]): Promise<Bookmark[]> {
  if (!folderIds.length) return []
  const { data } = await directus(event)<{ data: ItemRow[] }>('/items/list_items', {
    query: { fields: ITEM_FIELDS, filter: JSON.stringify({ list_id: { _in: folderIds } }), sort: '-date_created', limit: -1 },
  })
  return (data ?? []).map(toBookmark)
}

/** The bookmark, if it's in one of the user's folders (404 otherwise, never 403). */
export async function requireBookmark(event: H3Event, userId: string, id: number): Promise<Bookmark> {
  const folders = await listFolders(event, userId)
  const { data } = await directus(event)<{ data: ItemRow[] }>('/items/list_items', {
    query: { fields: ITEM_FIELDS, filter: JSON.stringify({ id: { _eq: id }, list_id: { _in: folders.map((f) => f.id) } }), limit: 1 },
  })
  if (!folders.length || !data?.[0]) throw createError({ statusCode: 404, statusMessage: 'Bookmark not found' })
  return toBookmark(data[0])
}

export async function saveBookmark(event: H3Event, id: number | null, fields: Record<string, unknown>): Promise<Bookmark> {
  const { data } = await directus(event)<{ data: ItemRow }>(id ? `/items/list_items/${id}` : '/items/list_items', {
    method: id ? 'PATCH' : 'POST',
    body: fields,
    query: { fields: ITEM_FIELDS },
  })
  return toBookmark(data)
}
