import type { ICommerceAdapter } from './base.adapter'
import type { NormalizedCategory, NormalizedProduct, Paginated, ProductQueryOptions, ProductSort } from '../types'
import { CommerceError, fromFetchError } from '../errors'
import { categoryTreeQuery, PRODUCT_BY_SLUG_QUERY, PRODUCTS_QUERY, ROOT_CATEGORY_QUERY } from './mage-os.queries'
import { oauth1Header } from './oauth1'
import { createMageOsServices } from './mage-os.services'

export interface MageOsOptions {
  /** Store base URL without trailing slash. */
  url: string
  /** Integration access token — REST only (live stock). Catalog GraphQL is public. */
  token?: string
  /**
   * The rest of the integration's credentials. When all are set, REST calls
   * are OAuth 1.0a-signed; otherwise `token` is sent as a Bearer token, which
   * needs oauth/consumer/enable_integration_as_bearer on the store.
   */
  consumerKey?: string
  consumerSecret?: string
  tokenSecret?: string
  storeCode?: string
  timeoutMs?: number
  categoryDepth?: number
  /** Injectable for tests. */
  fetch?: typeof fetch
}

const BACKEND = 'Mage-OS'
const DEFAULT_PAGE_SIZE = 20
/** GraphQL over GET (cacheable by Magento's page cache) while the URL stays short. */
const MAX_GET_URL = 6000
const INVENTORY_CONCURRENCY = 5

// ---------------------------------------------------------------------------
// Raw Magento shapes (only what normalizers read)
// ---------------------------------------------------------------------------

interface Money { value: number | null, currency: string | null }
interface RawPriceRange { minimum_price?: { regular_price?: Money, final_price?: Money } }
interface RawCustomAttribute { code: string, value?: string | null, selected_options?: { label: string, value: string }[] | null }

export interface RawProduct {
  __typename?: string
  uid: string
  sku: string
  name: string
  url_key: string | null
  updated_at?: string | null
  stock_status?: 'IN_STOCK' | 'OUT_OF_STOCK' | null
  only_x_left_in_stock?: number | null
  price_range?: RawPriceRange | null
  image?: { url?: string | null, label?: string | null } | null
  small_image?: { url?: string | null } | null
  media_gallery?: { url?: string | null, label?: string | null, position?: number | null, disabled?: boolean | null }[] | null
  categories?: { uid: string, name: string, url_key: string | null, url_path?: string | null }[] | null
  description?: { html?: string | null } | null
  short_description?: { html?: string | null } | null
  meta_title?: string | null
  meta_description?: string | null
  custom_attributesV2?: { items?: RawCustomAttribute[] | null } | null
  configurable_options?: {
    attribute_code: string
    label: string
    values?: { label: string, value_index: number, swatch_data?: { value?: string | null } | null }[] | null
  }[] | null
  variants?: {
    attributes?: { code: string, value_index: number, label: string }[] | null
    product?: { uid: string, sku: string, stock_status?: string | null, price_range?: RawPriceRange | null } | null
  }[] | null
}

export interface RawCategory {
  uid: string
  name: string
  url_key: string | null
  url_path: string | null
  level: number | null
  position: number | null
  include_in_menu: number | null
  product_count: number | null
  children?: RawCategory[] | null
}

// ---------------------------------------------------------------------------
// Normalizers
// ---------------------------------------------------------------------------

/**
 * Attributes Magento reports through custom_attributesV2 that are either
 * already top-level fields of NormalizedProduct or internal admin settings.
 */
const SYSTEM_ATTRIBUTES = new Set([
  'name', 'sku', 'description', 'short_description', 'price', 'special_price', 'special_from_date', 'special_to_date',
  'cost', 'tier_price', 'status', 'visibility', 'url_key', 'url_path', 'meta_title', 'meta_description', 'meta_keyword',
  'image', 'small_image', 'thumbnail', 'swatch_image', 'media_gallery', 'image_label', 'small_image_label', 'thumbnail_label',
  'options_container', 'page_layout', 'custom_layout', 'custom_layout_update_file', 'custom_design', 'custom_design_from',
  'custom_design_to', 'gift_message_available', 'msrp', 'msrp_display_actual_price_type', 'quantity_and_stock_status',
  'category_ids', 'tax_class_id', 'news_from_date', 'news_to_date', 'country_of_manufacture', 'weight', 'has_options',
  'required_options', 'links_purchased_separately', 'links_title', 'links_exist', 'samples_title', 'price_view', 'shipment_type',
  'sku_type', 'weight_type', 'price_type',
])

const isPlaceholder = (url: string) => url.includes('/placeholder/')

const num = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) ? value : 0)

/** Magento's "YYYY-MM-DD HH:MM:SS" (UTC) → ISO 8601. */
function toIso(value: string | null | undefined): string {
  if (!value) return ''
  const date = new Date(/T|Z$/.test(value) ? value : `${value.replace(' ', 'T')}Z`)
  return Number.isNaN(date.getTime()) ? value : date.toISOString()
}

function normalizePrice(range: RawPriceRange | null | undefined) {
  const min = range?.minimum_price
  const final = num(min?.final_price?.value)
  return {
    regular: num(min?.regular_price?.value ?? final),
    final,
    currency: min?.final_price?.currency ?? min?.regular_price?.currency ?? '',
  }
}

function normalizeImages(product: RawProduct): string[] {
  const gallery = (product.media_gallery ?? [])
    .filter((item) => item?.url && !item.disabled)
    .sort((a, b) => num(a.position) - num(b.position))
    .map((item) => item.url as string)
  const images = gallery.length ? gallery : [product.image?.url, product.small_image?.url].filter((url): url is string => !!url)
  return [...new Set(images)].filter((url) => !isPlaceholder(url))
}

function normalizeCustomAttributes(items: RawCustomAttribute[] | null | undefined): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const item of items ?? []) {
    if (!item?.code || SYSTEM_ATTRIBUTES.has(item.code)) continue
    if (item.selected_options?.length) {
      const labels = item.selected_options.map((option) => option.label)
      out[item.code] = labels.length === 1 ? labels[0] : labels
    } else if (item.value !== null && item.value !== undefined && item.value !== '') {
      out[item.code] = item.value
    }
  }
  return out
}

/**
 * Flattens a Magento product (nested price_range, media_gallery, typename
 * fragments, custom_attributesV2) into the NormalizedProduct contract.
 * Backend-specific extras go under `attributes`.
 */
export function normalizeProduct(product: RawProduct): NormalizedProduct {
  const attributes: Record<string, any> = {
    type: (product.__typename ?? 'SimpleProduct').replace(/Product$/, '').toLowerCase() || 'simple',
    ...normalizeCustomAttributes(product.custom_attributesV2?.items),
  }

  if (product.configurable_options?.length) {
    attributes.options = product.configurable_options.map((option) => ({
      code: option.attribute_code,
      label: option.label,
      values: (option.values ?? []).map((value) => ({
        id: value.value_index,
        label: value.label,
        ...(value.swatch_data?.value ? { swatch: value.swatch_data.value } : {}),
      })),
    }))
  }
  if (product.variants?.length) {
    attributes.variants = product.variants
      .filter((variant) => variant?.product)
      .map((variant) => ({
        id: variant.product!.uid,
        sku: variant.product!.sku,
        inStock: variant.product!.stock_status === 'IN_STOCK',
        price: normalizePrice(variant.product!.price_range),
        options: Object.fromEntries((variant.attributes ?? []).map((attr) => [attr.code, attr.value_index])),
      }))
  }
  if (product.description?.html) attributes.description = product.description.html
  if (product.short_description?.html) attributes.shortDescription = product.short_description.html
  if (product.meta_title) attributes.metaTitle = product.meta_title
  if (product.meta_description) attributes.metaDescription = product.meta_description
  if (typeof product.only_x_left_in_stock === 'number') attributes.onlyLeftInStock = product.only_x_left_in_stock

  return {
    id: product.uid,
    sku: product.sku,
    name: product.name,
    slug: product.url_key ?? '',
    price: normalizePrice(product.price_range),
    inStock: product.stock_status === 'IN_STOCK',
    images: normalizeImages(product),
    categories: (product.categories ?? []).map((category) => ({
      id: category.uid,
      name: category.name,
      slug: category.url_key ?? '',
    })),
    attributes,
    updatedAt: toIso(product.updated_at),
  }
}

/** Levels are reported relative to the store root (top-level categories are 1). */
export function normalizeCategory(category: RawCategory, rootLevel: number): NormalizedCategory {
  return {
    id: category.uid,
    name: category.name,
    slug: category.url_key ?? '',
    path: category.url_path ?? category.url_key ?? '',
    level: num(category.level) - rootLevel,
    position: num(category.position),
    productCount: num(category.product_count),
    includeInMenu: category.include_in_menu !== 0,
    children: (category.children ?? [])
      .map((child) => normalizeCategory(child, rootLevel))
      .sort((a, b) => a.position - b.position),
  }
}

const SORTS: Record<ProductSort, Record<string, 'ASC' | 'DESC'>> = {
  'relevance': { relevance: 'DESC' },
  'position': { position: 'ASC' },
  'name': { name: 'ASC' },
  '-name': { name: 'DESC' },
  'price': { price: 'ASC' },
  '-price': { price: 'DESC' },
}

/** ProductQueryOptions → Magento `products` query variables. */
export function productVariables(params: ProductQueryOptions) {
  const filter: Record<string, unknown> = {}
  if (params.categoryId) filter.category_uid = { eq: params.categoryId }
  else if (params.categoryPath) filter.category_url_path = { eq: params.categoryPath }
  if (params.skus?.length) filter.sku = { in: params.skus }
  if (params.priceMin !== undefined || params.priceMax !== undefined) {
    filter.price = {
      ...(params.priceMin !== undefined ? { from: String(params.priceMin) } : {}),
      ...(params.priceMax !== undefined ? { to: String(params.priceMax) } : {}),
    }
  }
  const sort = params.sort ?? (params.search ? 'relevance' : (params.categoryId || params.categoryPath) ? 'position' : 'name')
  return {
    search: params.search || undefined,
    filter,
    sort: SORTS[sort],
    pageSize: params.pageSize ?? DEFAULT_PAGE_SIZE,
    currentPage: params.page ?? 1,
  }
}

// ---------------------------------------------------------------------------
// Adapter
// ---------------------------------------------------------------------------

export class MageOsAdapter implements ICommerceAdapter {
  readonly id = 'mage-os'
  private readonly fetch: typeof fetch
  private readonly timeoutMs: number
  private readonly categoryDepth: number

  // Beyond the catalog (src/adapters/mage-os.services.ts).
  readonly search: NonNullable<ICommerceAdapter['search']>
  readonly suggest: NonNullable<ICommerceAdapter['suggest']>
  readonly getStoreConfig: NonNullable<ICommerceAdapter['getStoreConfig']>
  readonly resolveCategoryId: NonNullable<ICommerceAdapter['resolveCategoryId']>
  readonly reviews: NonNullable<ICommerceAdapter['reviews']>
  readonly customers: NonNullable<ICommerceAdapter['customers']>
  readonly orders: NonNullable<ICommerceAdapter['orders']>
  readonly giftCards: NonNullable<ICommerceAdapter['giftCards']>
  readonly sellers: NonNullable<ICommerceAdapter['sellers']>
  readonly catalogSync: NonNullable<ICommerceAdapter['catalogSync']>
  readonly admin: NonNullable<ICommerceAdapter['admin']>
  readonly mirror: NonNullable<ICommerceAdapter['mirror']>

  constructor(private readonly options: MageOsOptions) {
    if (!options.url) throw new CommerceError('NOT_CONFIGURED', 'MAGEOS_URL is not set')
    this.fetch = options.fetch ?? globalThis.fetch
    this.timeoutMs = options.timeoutMs ?? 8000
    this.categoryDepth = options.categoryDepth ?? 6

    const services = createMageOsServices(this, normalizeProduct, productVariables,
      (skus) => this.getProducts({ skus, pageSize: Math.min(skus.length, 100) }))
    this.search = services.search
    this.suggest = services.suggest
    this.getStoreConfig = services.getStoreConfig
    this.resolveCategoryId = services.resolveCategoryId
    this.reviews = services.reviews
    this.customers = services.customers
    this.orders = services.orders
    this.giftCards = services.giftCards
    this.sellers = services.sellers
    this.catalogSync = services.catalogSync
    this.admin = services.admin
    this.mirror = services.mirror
  }

  async getProducts(params: ProductQueryOptions): Promise<NormalizedProduct[]> {
    return (await this.getProductPage(params)).items
  }

  async getProductPage(params: ProductQueryOptions): Promise<Paginated<NormalizedProduct>> {
    const variables = productVariables(params)
    const data = await this.graphql<{ products: { total_count: number, page_info: { current_page: number, page_size: number, total_pages: number }, items: RawProduct[] } }>(PRODUCTS_QUERY, variables)
    const products = data.products
    return {
      items: (products.items ?? []).filter(Boolean).map(normalizeProduct),
      page: products.page_info?.current_page ?? variables.currentPage,
      pageSize: products.page_info?.page_size ?? variables.pageSize,
      total: products.total_count ?? 0,
      totalPages: products.page_info?.total_pages ?? 0,
    }
  }

  async getProductBySlug(slug: string): Promise<NormalizedProduct | null> {
    const data = await this.graphql<{ products: { items: RawProduct[] } }>(PRODUCT_BY_SLUG_QUERY, { slug })
    const product = data.products.items?.[0]
    return product ? normalizeProduct(product) : null
  }

  async getCategories(): Promise<NormalizedCategory[]> {
    const { storeConfig } = await this.graphql<{ storeConfig: { root_category_uid: string } }>(ROOT_CATEGORY_QUERY)
    const data = await this.graphql<{ categories: { items: RawCategory[] } }>(categoryTreeQuery(this.categoryDepth), { uid: storeConfig.root_category_uid })
    const root = data.categories.items?.[0]
    if (!root) return []
    const rootLevel = num(root.level)
    return (root.children ?? [])
      .map((child) => normalizeCategory(child, rootLevel))
      .sort((a, b) => a.position - b.position)
  }

  /**
   * Live quantities from REST (/V1/stockItems/:sku — the default stock, which
   * MSI keeps in sync). Needs MAGEOS_TOKEN from an integration with the
   * Catalog › Inventory resource. GraphQL only exposes IN_STOCK/OUT_OF_STOCK.
   */
  async getInventory(skus: string[]): Promise<Record<string, number>> {
    const result: Record<string, number> = {}
    const queue = [...new Set(skus)]
    const worker = async () => {
      for (let sku = queue.shift(); sku !== undefined; sku = queue.shift()) {
        const item = await this.rest<{ qty?: number | null, is_in_stock?: boolean } | null>('GET', `/V1/stockItems/${encodeURIComponent(sku)}`, { allowNotFound: true })
        if (item) result[sku] = item.is_in_stock === false ? 0 : Math.max(0, num(item.qty))
      }
    }
    await Promise.all(Array.from({ length: Math.min(INVENTORY_CONCURRENCY, queue.length) }, worker))
    return result
  }

  // -------------------------------------------------------------------------
  // Transport
  // -------------------------------------------------------------------------

  private headers(extra: Record<string, string> = {}): Record<string, string> {
    return {
      'Accept': 'application/json',
      ...(this.options.storeCode ? { Store: this.options.storeCode } : {}),
      ...extra,
    }
  }

  private async request(url: string, init: Omit<RequestInit, 'headers'> & { headers: Record<string, string> | (() => Record<string, string>), retry?: boolean }): Promise<Response> {
    // One retry for network failures and 502/503/504, which are often a
    // momentary restart or cache flush on the Magento side — reads only:
    // repeating a write (a refund, a new customer) could apply it twice.
    const retries = init.retry === false ? 0 : 1
    for (let attempt = 0; ; attempt++) {
      try {
        const headers = typeof init.headers === 'function' ? init.headers() : init.headers
        const response = await this.fetch(url, { ...init, headers, signal: AbortSignal.timeout(this.timeoutMs) })
        if (attempt < retries && [502, 503, 504].includes(response.status)) {
          await new Promise((resolve) => setTimeout(resolve, 250))
          continue
        }
        return response
      } catch (error) {
        const mapped = fromFetchError(error, BACKEND)
        if (attempt < retries && mapped.code === 'UPSTREAM_OFFLINE') {
          await new Promise((resolve) => setTimeout(resolve, 250))
          continue
        }
        throw mapped
      }
    }
  }

  private statusError(response: Response, what: string, detail?: string): CommerceError {
    if (response.status === 401 || response.status === 403) {
      return new CommerceError('UPSTREAM_AUTH', `${BACKEND} rejected the ${what} request${detail ? `: ${detail}` : ''}`)
    }
    if (response.status === 503) {
      return new CommerceError('UPSTREAM_UNAVAILABLE', `${BACKEND} is unavailable (maintenance mode or overloaded)`)
    }
    if (response.status >= 500) {
      return new CommerceError('UPSTREAM_UNAVAILABLE', `${BACKEND} answered ${response.status} to the ${what} request`)
    }
    return new CommerceError('UPSTREAM_ERROR', `${BACKEND} answered ${response.status} to the ${what} request${detail ? `: ${detail}` : ''}`)
  }

  async graphql<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
    const endpoint = `${this.options.url}/graphql`
    const compact = query.replace(/\s+/g, ' ').trim()
    const getUrl = `${endpoint}?${new URLSearchParams({ query: compact, variables: JSON.stringify(variables) })}`
    // Mutations always POST (Magento refuses them over GET) and are never retried.
    const mutation = /^mutation\b/.test(compact)
    const response = !mutation && getUrl.length <= MAX_GET_URL
      ? await this.request(getUrl, { method: 'GET', headers: this.headers() })
      : await this.request(endpoint, { method: 'POST', retry: !mutation, headers: this.headers({ 'Content-Type': 'application/json' }), body: JSON.stringify({ query: compact, variables }) })

    type GraphQLBody = { data?: T | null, errors?: { message: string, extensions?: { category?: string } }[] }
    let body: GraphQLBody | null = null
    try {
      body = await response.json() as GraphQLBody
    } catch {
      // Not JSON (an HTML maintenance or proxy error page).
    }
    if (!response.ok && !body?.errors?.length) throw this.statusError(response, 'GraphQL')
    if (body?.errors?.length) {
      const first = body.errors[0]!
      if (first.extensions?.category === 'graphql-authorization') {
        throw new CommerceError('UPSTREAM_AUTH', `${BACKEND} GraphQL: ${first.message}`)
      }
      // A refused mutation input (duplicate email, bad rating, …) is the caller's problem.
      if (mutation && /^graphql-(input|already-exists|no-such-entity)$/.test(first.extensions?.category ?? '')) {
        throw new CommerceError('REJECTED', first.message)
      }
      // Partial data (e.g. one product type can't resolve) still beats an error.
      if (!body.data) throw new CommerceError('UPSTREAM_ERROR', `${BACKEND} GraphQL: ${first.message}`)
    }
    if (!body?.data) throw new CommerceError('UPSTREAM_ERROR', `${BACKEND} GraphQL returned no data`)
    return body.data
  }

  /**
   * Magento REST (`/rest[/<store>]/V1…`). `auth: 'integration'` (default)
   * signs with the integration (OAuth 1.0a, or Bearer when only the token is
   * set); `{ bearer }` sends a customer's own token, for self-scoped routes.
   * Some Meeovi_MarketplaceApi routes return JSON *as a string*; those are
   * decoded here.
   */
  async rest<T>(method: 'GET' | 'POST' | 'PUT' | 'DELETE', path: string, options: { body?: unknown, allowNotFound?: boolean, auth?: 'integration' | { bearer: string } } = {}): Promise<T> {
    const url = `${this.options.url}/rest${this.options.storeCode ? `/${encodeURIComponent(this.options.storeCode)}` : ''}${path}`
    const auth = options.auth ?? 'integration'
    const { token, consumerKey, consumerSecret, tokenSecret } = this.options
    if (auth === 'integration' && !token) {
      throw new CommerceError('NOT_CONFIGURED', 'MAGEOS_TOKEN (and the integration\'s other credentials) are not set')
    }
    // Signed per request: the nonce and timestamp must be fresh on a retry too.
    const authorization = () => (auth !== 'integration'
      ? `Bearer ${auth.bearer}`
      : consumerKey && consumerSecret && tokenSecret
        ? oauth1Header(method, url, { consumerKey, consumerSecret, accessToken: token!, accessTokenSecret: tokenSecret })
        : `Bearer ${token}`)
    const response = await this.request(url, {
      method,
      retry: method === 'GET',
      headers: () => this.headers({
        Authorization: authorization(),
        ...(options.body === undefined ? {} : { 'Content-Type': 'application/json' }),
      }),
      ...(options.body === undefined ? {} : { body: JSON.stringify(options.body) }),
    })
    const data = await response.json().catch(() => null) as unknown
    if (!response.ok) {
      const body = data as { message?: string, parameters?: Record<string, string> | string[] } | null
      // Magento's message templates use %name / %1 placeholders.
      const detail = body?.message?.replace(/%(\w+)/g, (_, key: string) => {
        const params = body.parameters
        const value = Array.isArray(params) ? params[Number(key) - 1] : params?.[key]
        return value ?? key
      })
      if (response.status === 404) {
        if (options.allowNotFound) return null as T
        // "Request does not match any route" = the module providing it isn't installed.
        if (detail && /does not match any route/i.test(detail)) {
          throw new CommerceError('UPSTREAM_ERROR', `${BACKEND} has no ${method} ${path.split('?')[0]} route (is the Mage-OS module installed?)`)
        }
        throw new CommerceError('NOT_FOUND', detail || 'Not found')
      }
      if ([400, 409, 422].includes(response.status)) throw new CommerceError('REJECTED', detail || `${BACKEND} rejected the request`)
      throw this.statusError(response, 'REST', detail)
    }
    if (typeof data === 'string' && /^\s*[[{]/.test(data)) {
      try {
        return JSON.parse(data) as T
      } catch {
        // A plain string that happens to start with a bracket.
      }
    }
    return data as T
  }
}
