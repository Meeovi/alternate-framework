import { createHash } from 'node:crypto'
import { CommerceError } from './errors'
import type { ProductQueryOptions, ProductSort, SearchOptions } from './types'

export const MAX_PAGE_SIZE = 100
export const MAX_STOCK_SKUS = 50
const SORTS = new Set<ProductSort>(['relevance', 'position', 'name', '-name', 'price', '-price'])
const SKU_RE = /^[^\s/?#][^/?#]{0,63}$/
const SLUG_RE = /^[a-z0-9][a-z0-9._/-]{0,254}$/i

type Query = Record<string, unknown>

const first = (value: unknown): string | undefined => {
  const v = Array.isArray(value) ? value[0] : value
  return typeof v === 'string' && v.trim() !== '' ? v.trim() : undefined
}

function positiveInt(query: Query, keys: string[], fallback: number, max: number): number {
  const raw = keys.map((key) => first(query[key])).find((v) => v !== undefined)
  if (raw === undefined) return fallback
  const value = Number(raw)
  if (!Number.isInteger(value) || value < 1) throw new CommerceError('INVALID_QUERY', `${keys[0]} must be a whole number ≥ 1`)
  return Math.min(value, max)
}

function price(query: Query, key: string): number | undefined {
  const raw = first(query[key])
  if (raw === undefined) return undefined
  const value = Number(raw)
  if (!Number.isFinite(value) || value < 0) throw new CommerceError('INVALID_QUERY', `${key} must be a number ≥ 0`)
  return value
}

export function parseSkus(value: unknown, max: number): string[] {
  const list = (Array.isArray(value) ? value : typeof value === 'string' ? value.split(',') : [])
    .map((sku) => (typeof sku === 'string' ? sku.trim() : ''))
    .filter(Boolean)
  if (list.length > max) throw new CommerceError('INVALID_QUERY', `At most ${max} SKUs per request`)
  for (const sku of list) {
    if (!SKU_RE.test(sku)) throw new CommerceError('INVALID_QUERY', `Invalid SKU: ${sku.slice(0, 64)}`)
  }
  return [...new Set(list)]
}

/**
 * GET /commerce/products query string → ProductQueryOptions.
 * page, limit (or pageSize), search, category (id), category_path,
 * category_slug (resolved to an id by the route),
 * sku (comma list), price_min, price_max,
 * sort: relevance | position | name | -name | price | -price
 */
export function parseProductQuery(query: Query): ProductQueryOptions {
  const sort = first(query.sort)
  if (sort !== undefined && !SORTS.has(sort as ProductSort)) {
    throw new CommerceError('INVALID_QUERY', `sort must be one of: ${[...SORTS].join(', ')}`)
  }
  const categoryId = first(query.category)
  const categoryPath = first(query.category_path)
  const categorySlug = first(query.category_slug)
  if (categorySlug !== undefined && !SLUG_RE.test(categorySlug)) throw new CommerceError('INVALID_QUERY', 'Invalid category_slug')
  if (sort === 'position' && !categoryId && !categoryPath && !categorySlug) {
    throw new CommerceError('INVALID_QUERY', 'sort=position needs a category or category_path')
  }
  if (categoryPath !== undefined && !SLUG_RE.test(categoryPath)) throw new CommerceError('INVALID_QUERY', 'Invalid category_path')
  if (categoryId !== undefined && categoryId.length > 128) throw new CommerceError('INVALID_QUERY', 'Invalid category')

  const search = first(query.search)
  if (search !== undefined && search.length > 200) throw new CommerceError('INVALID_QUERY', 'search is too long')

  const priceMin = price(query, 'price_min')
  const priceMax = price(query, 'price_max')
  if (priceMin !== undefined && priceMax !== undefined && priceMin > priceMax) {
    throw new CommerceError('INVALID_QUERY', 'price_min is greater than price_max')
  }
  const skus = query.sku === undefined ? undefined : parseSkus(query.sku, MAX_PAGE_SIZE)

  const options: ProductQueryOptions = {
    page: positiveInt(query, ['page'], 1, 10_000),
    pageSize: positiveInt(query, ['limit', 'pageSize'], 20, MAX_PAGE_SIZE),
    ...(search ? { search } : {}),
    ...(categoryId ? { categoryId } : categoryPath ? { categoryPath } : {}),
    ...(skus?.length ? { skus } : {}),
    ...(priceMin !== undefined ? { priceMin } : {}),
    ...(priceMax !== undefined ? { priceMax } : {}),
    ...(sort ? { sort: sort as ProductSort } : {}),
  }
  return options
}

export function parseSlug(slug: string | undefined): string {
  if (!slug || !SLUG_RE.test(slug)) throw new CommerceError('INVALID_QUERY', 'Invalid product slug')
  return slug
}

/** A short, order-independent cache key for a set of options. */
export function optionsKey(options: object): string {
  const stable = JSON.stringify(options, (_, value) =>
    value && typeof value === 'object' && !Array.isArray(value)
      ? Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)))
      : value)
  return createHash('sha1').update(stable).digest('hex').slice(0, 20)
}

/**
 * GET /commerce/search query string → SearchOptions.
 * q (required), page, limit, category (id), sort, facets=true
 */
export function parseSearchQuery(query: Query): SearchOptions {
  const q = first(query.q)
  if (!q) throw new CommerceError('INVALID_QUERY', 'q is required')
  if (q.length > 200) throw new CommerceError('INVALID_QUERY', 'q is too long')
  const sort = first(query.sort)
  if (sort !== undefined && !SORTS.has(sort as ProductSort)) throw new CommerceError('INVALID_QUERY', `sort must be one of: ${[...SORTS].join(', ')}`)
  const categoryId = first(query.category)
  if (categoryId !== undefined && categoryId.length > 128) throw new CommerceError('INVALID_QUERY', 'Invalid category')
  return {
    query: q,
    page: positiveInt(query, ['page'], 1, 10_000),
    pageSize: positiveInt(query, ['limit', 'pageSize'], 20, MAX_PAGE_SIZE),
    ...(categoryId ? { categoryId } : {}),
    ...(sort ? { sort: sort as ProductSort } : {}),
    facets: first(query.facets) === 'true' || first(query.facets) === '1',
  }
}

/** ?category_slug=… from a products query, if any. */
export const categorySlugOf = (query: Query) => first(query.category_slug)
