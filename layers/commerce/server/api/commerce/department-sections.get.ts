// GET /api/commerce/department-sections?slug=<department slug>
// A department page's secondary product rows: Best Sellers (the "Best
// Sellers" showcase) and Events (products of type Event), 10 each. The page
// asks for them in the browser once the visitor scrolls near them, so
// rendering the page no longer waits on these Directus queries; the answer
// is cached for 5 minutes per department.
import { createError, getQuery } from 'h3'
import { readItems } from '@directus/sdk'
import { getDirectusFacade } from '../../utils/directusClient'

type Row = Record<string, any>

const FIELDS = ['*', 'products.products_id.*', 'products.products_id.image.*']

/** The departments matching the filter, as a flat list of their products. */
const productsOf = (departments: Row[] | null) =>
  (Array.isArray(departments) ? departments : [])
    .flatMap((dept) => dept?.products || [])
    .map((p: Row) => p?.products_id)
    .filter(Boolean)

export default defineCachedEventHandler(async (event) => {
  const slug = String(getQuery(event).slug || '').trim()
  if (!/^[\w-]{1,100}$/.test(slug)) throw createError({ statusCode: 400, statusMessage: 'A department slug is required' })

  const directus = getDirectusFacade()
  const read = (filter: Row) => directus.request(readItems('departments' as any, { fields: FIELDS, limit: 10, filter: { slug: { _eq: slug }, ...filter } } as any))
    .then((rows) => productsOf(rows as Row[]).slice(0, 10))
    .catch((error) => {
      console.error('[department-sections]', slug, (error as Error)?.message || error)
      return [] as Row[]
    })

  const [best, events] = await Promise.all([
    read({ showcases: { showcases_id: { name: { _eq: 'Best Sellers' } } } }),
    read({ products: { products_id: { product_types: { product_types_id: { name: { _eq: 'Event' } } } } } }),
  ])
  return { best, events }
}, {
  name: 'department-sections',
  maxAge: 300,
  swr: true,
  getKey: (event) => String(getQuery(event).slug || '').replace(/[^\w-]/g, '').slice(0, 100),
})
