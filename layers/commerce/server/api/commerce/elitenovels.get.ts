// GET /api/commerce/elitenovels?kind=characters|stories&limit=
// Characters and stories from Elite Novels' own Directus (novels.meeovicms.com,
// public read), for the Elite Novels department page. They used to be read
// from Meeovi's Directus, which has no characters or stories, so the page's
// sections were always empty. Each item comes back ready to show: its image
// as a full URL and its link to its page on elitenovels.com.
import { createError, getQuery } from 'h3'

const NOVELS_DIRECTUS = (process.env.ELITENOVELS_DIRECTUS_URL || 'https://novels.meeovicms.com').replace(/\/+$/, '')
const NOVELS_SITE = (process.env.ELITENOVELS_SITE_URL || 'https://www.elitenovels.com').replace(/\/+$/, '')

type Row = Record<string, any>

const image = (row: Row) => (row?.image?.id ? `${NOVELS_DIRECTUS}/assets/${row.image.id}?width=500&format=webp` : null)

const KINDS = {
  characters: {
    query: {
      fields: 'id,name,alias,type,slug,image.id',
      // Characters with a picture first (most of the 4,885 have none).
      filter: JSON.stringify({ _and: [{ status: { _eq: 'published' } }, { image: { _nnull: true } }, { slug: { _nnull: true } }] }),
      sort: '-id',
    },
    shape: (row: Row) => ({
      id: row.id,
      name: row.name,
      alias: row.alias || null,
      type: row.type || null,
      image: image(row),
      url: `${NOVELS_SITE}/characters/${encodeURIComponent(row.slug)}`,
    }),
  },
  stories: {
    query: {
      fields: 'id,name,slug,date_created,image.id',
      filter: JSON.stringify({ _and: [{ status: { _in: ['Published', 'published'] } }, { slug: { _nnull: true } }] }),
      sort: '-id',
    },
    shape: (row: Row) => ({
      id: row.id,
      name: row.name,
      date: row.date_created || null,
      image: image(row),
      url: `${NOVELS_SITE}/story/${encodeURIComponent(row.slug)}`,
    }),
  },
} as const

export default defineCachedEventHandler(async (event) => {
  const query = getQuery(event)
  const kind = String(query.kind || '') as keyof typeof KINDS
  const spec = KINDS[kind]
  if (!spec) throw createError({ statusCode: 400, statusMessage: 'kind must be characters or stories' })
  const limit = Math.min(Math.max(Number(query.limit) || 12, 1), 24)
  try {
    const res = await $fetch<{ data: Row[] }>(`${NOVELS_DIRECTUS}/items/${kind}`, {
      query: { ...spec.query, limit },
      headers: { 'User-Agent': 'Meeovi' },
      timeout: 15000,
    })
    return (res?.data || []).map(spec.shape)
  } catch (error) {
    console.error(`[elitenovels] ${kind} unavailable:`, (error as Error)?.message || error)
    return []
  }
}, {
  // The novels database is a slow remote MySQL: one fetch per kind every 10 minutes.
  name: 'elitenovels-feed',
  maxAge: 600,
  swr: true,
  getKey: (event) => {
    const query = getQuery(event)
    return `${query.kind}-${query.limit || 12}`
  },
})
