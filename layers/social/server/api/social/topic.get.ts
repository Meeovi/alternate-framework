// GET /api/social/topic?department=<id>  or  ?category=<id>
// What people are sharing about a department's or category's topic, for its
// page: notes (Meeovi's own, then Bluesky / the Fediverse), public lists,
// events and spaces. Something is about the topic when it's linked to the
// department or category, or its name, title, description or tags mention
// the topic's name. Public things only.
import { createError, getQuery } from 'h3'
import { createDirectus, readItem, readItems, rest, staticToken } from '@directus/sdk'
import { federationNetworks, withNetworkTimeout } from '../../utils/federation'
import { DIRECTUS_NETWORK, PUBLIC_POSTS } from '../../utils/federation-directus'
import type { FederatedPost } from '../../../shared/types/federation'

const directus = createDirectus(process.env.DIRECTUS_URL!)
  .with(rest())
  .with(staticToken(process.env.NUXTUS_DIRECTUS_STATIC_TOKEN!))

type Row = Record<string, any>
const read = (collection: string, query: Row) =>
  directus.request(readItems(collection as any, query as any)).catch((error) => {
    console.error(`[topic] ${collection}:`, (error as Error)?.message || error)
    return [] as Row[]
  }) as Promise<Row[]>

const LIMIT = 12
const id = (value: unknown) => (/^\d+$/.test(String(value ?? '')) ? Number(value) : null)
const mentions = (fields: string[], term: string) => fields.map((field) => ({ [field]: { _icontains: term } }))

// Network searches match any word ("Elite Novels" finds Snapdragon 8 Elite
// phones), so a note only counts when it has the whole name, or the name
// as one hashtag (#EliteNovels).
const squash = (text: string) => text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '')
function about(note: FederatedPost, term: string): boolean {
  const phrase = term.toLowerCase().replace(/\s+/g, ' ')
  const text = `${note.text || ''} ${note.html || ''}`.toLowerCase().replace(/\s+/g, ' ')
  const tag = squash(term)
  return text.includes(phrase) || (note.hashtags || []).some((h) => squash(h) === tag) || text.includes(`#${tag}`)
}

export default defineCachedEventHandler(async (event) => {
  const query = getQuery(event)
  const departmentId = id(query.department)
  const categoryId = departmentId ? null : id(query.category)
  if (!departmentId && !categoryId) throw createError({ statusCode: 400, statusMessage: 'department or category is required' })

  const topic = await directus.request(departmentId
    ? readItem('departments' as any, departmentId, { fields: ['id', 'name'] })
    : readItem('categories' as any, categoryId!, { fields: ['id', 'name'] })).catch(() => null) as Row | null
  const term = String(topic?.name || '').trim()
  if (!term) throw createError({ statusCode: 404, statusMessage: 'Not found' })

  // posts.categories and spaces.categories are their departments (junctions
  // posts_departments / spaces_departments); lists link to both.
  const linked = departmentId
    ? { posts: [{ categories: { departments_id: { _eq: departmentId } } }], spaces: [{ categories: { departments_id: { _eq: departmentId } } }], lists: [{ department: { departments_id: { _eq: departmentId } } }] }
    : { posts: [], spaces: [], lists: [{ category: { categories_id: { _eq: categoryId } } }] }

  const [posts, lists, spaces, events, federated] = await Promise.all([
    read('posts', {
      fields: ['*'],
      filter: { _and: [...PUBLIC_POSTS, { _or: [...linked.posts, { tags: { tags_id: { name: { _icontains: term } } } }, ...mentions(['title', 'summary'], term)] }] },
      sort: ['-date_created'],
      limit: LIMIT,
    }),
    read('lists', {
      fields: ['id', 'name', 'description', 'type', 'slug', 'image'],
      filter: { _and: [{ status: { _eq: 'Public' } }, { _or: [...linked.lists, ...mentions(['name', 'description'], term)] }] },
      sort: ['-date_created'],
      limit: LIMIT,
    }),
    read('spaces', {
      fields: ['*'],
      filter: { _and: [{ status: { _in: ['Public', 'public'] } }, { _or: [...linked.spaces, ...mentions(['name', 'description'], term)] }] },
      sort: ['-date_created'],
      limit: LIMIT,
    }),
    read('events', {
      fields: ['id', 'name', 'description', 'type', 'location', 'date', 'event_calendar', 'url', 'tickets_url', 'image', 'slug'],
      filter: { _and: [{ status: { _eq: 'published' } }, { _or: mentions(['name', 'description', 'type'], term) }] },
      sort: ['date'],
      limit: LIMIT,
    }),
    // Notes from the other networks (Meeovi's own are the posts above).
    Promise.all(federationNetworks()
      .filter((network) => network.id !== DIRECTUS_NETWORK && network.searchPosts)
      .map((network) => withNetworkTimeout(network.searchPosts!(term, { limit: 8 })).catch((error) => {
        console.error(`[topic] ${network.id} search:`, (error as Error)?.message || error)
        return [] as FederatedPost[]
      }))).then((results) => results.flat().filter((note) => about(note, term))),
  ])

  const notes = [
    ...posts,
    ...federated.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))),
  ].slice(0, LIMIT)

  return { topic: { id: topic!.id, name: term }, notes, lists, events, spaces }
}, {
  name: 'social-topic',
  maxAge: 300,
  swr: true,
  getKey: (event) => {
    const query = getQuery(event)
    return id(query.department) ? `department-${id(query.department)}` : `category-${id(query.category)}`
  },
})
