import { createDirectus, rest, staticToken } from '@directus/sdk'
import type { RestCommand } from '@directus/sdk'
import { commerce, type BackendSeller, type NormalizedProduct } from '@mframework/mageos-commerce-sdk'
import type { BackendRefund, CategoryProductsRef, CommerceBackendAdapter, CommerceCustomerLinker, DirectusRequestDescriptor, PaidOrder } from 'alternate-sdk'

/**
 * The Mage-OS store through Directus: the `/commerce/*` endpoint extension
 * (packages/plugins/CMS-Content/directus-extension-mageos-commerce), called
 * with the Directus SDK like every other Directus read in the app. Used when
 * `runtimeConfig.public.magento.via` is 'directus' (the default) in place of
 * adapter-magento calling Magento itself.
 *
 * Registered under the same id, 'magento', so product keys (`magento:<sku>`
 * in carts, lists and orders) and every CommerceBackendRegistry caller keep
 * working unchanged. Output shapes match adapter-magento's.
 *
 * Clients:
 *  - Nitro (server routes): Directus itself with the app's static token,
 *    which Directus trusts (MAGEOS_TRUSTED_USERS) for customers, orders,
 *    refunds and admin;
 *  - server-side rendering: Directus itself without a token — the Vue
 *    renderer has its own copy of the registry, and pages only read the
 *    catalogue;
 *  - browser: the same-origin /api/cms proxy, which only forwards the public
 *    catalogue routes, without a token.
 * Only the catalogue methods exist on the last two.
 */

type Client = { request<Output>(options: RestCommand<Output, any>): Promise<Output> }

export const MAGEOS_BACKEND_ID = 'magento'

/** The app's static-token Directus client (server only). */
export function trustedCommerceClient(url: string, token: string): Client {
  return createDirectus(url).with(staticToken(token)).with(rest())
}

/** The browser's client: public catalogue routes through /api/cms. */
export function publicCommerceClient(origin: string): Client {
  return createDirectus(`${origin}/api/cms`).with(rest())
}

/** Server-side rendering's client: Directus itself, without a token (public routes only). */
export function anonymousCommerceClient(url: string): Client {
  return createDirectus(url).with(rest())
}

/** Directus SDK failures ({ errors, response }) as Errors carrying the HTTP status. */
function toError(error: any): Error {
  const status = Number(error?.response?.status) || (error instanceof Error ? undefined : 502)
  const first = error?.errors?.[0]
  // Network failures etc. are plain Errors with no response: pass them on.
  if (!status) return error
  return Object.assign(error instanceof Error ? error : new Error(first?.message || `Commerce request failed (${status})`), {
    message: first?.message || error?.message || `Commerce request failed (${status})`,
    status,
    statusCode: status,
    code: first?.extensions?.code,
  })
}

async function call<T>(client: Client, command: RestCommand<T, any>): Promise<T> {
  try {
    return await client.request(command)
  } catch (error) {
    throw toError(error)
  }
}

/** Not found is null, anything else still throws. */
async function orNull<T>(promise: Promise<T>): Promise<T | null> {
  try {
    return await promise
  } catch (error: any) {
    if (error?.status === 404) return null
    throw error
  }
}

const NO_SHIPPING_TYPES = new Set(['virtual', 'downloadable'])

/** A product in the storefront's (Directus `products`) shape — what adapter-magento's normalizer returns. */
export function toStorefrontProduct(product: NormalizedProduct) {
  const attributes = product.attributes ?? {}
  return {
    id: product.id,
    source: MAGEOS_BACKEND_ID,
    sku: product.sku,
    name: product.name,
    // The storefront only serves enabled products.
    status: 'published',
    in_stock: product.inStock,
    requires_shipping: !NO_SHIPPING_TYPES.has(String(attributes.type ?? '')),
    price: product.price?.final ?? 0,
    description: attributes.description ?? null,
    short_description: attributes.shortDescription ?? null,
    image: product.images?.[0] ?? null,
    gallery_images: product.images ?? [],
  }
}

const PAGE_SIZE = 50
const positive = (value: unknown) => (Number.isInteger(Number(value)) && Number(value) > 0 ? Number(value) : undefined)

async function productList(client: Client, params: Record<string, any> = {}) {
  const page = await call(client, commerce.products({
    limit: Math.min(positive(params.limit) ?? PAGE_SIZE, PAGE_SIZE),
    page: positive(params.page),
    search: typeof params.search === 'string' && params.search.trim() ? params.search.trim() : undefined,
  }))
  return page.items.map(toStorefrontProduct)
}

/** Listings leave out descriptions; one product's own route has them. */
async function withDetail(client: Client, product: NormalizedProduct): Promise<NormalizedProduct> {
  return (await orNull(call(client, commerce.product(product.slug))).catch(() => null)) ?? product
}

async function productBySku(client: Client, sku: string) {
  const page = await call(client, commerce.products({ sku: [sku], limit: 1 }))
  return page.items[0] ? toStorefrontProduct(await withDetail(client, page.items[0])) : null
}

const ADMIN_COLLECTIONS = new Set(['orders', 'customers', 'creditmemos'])

function refuse(message: string, status: number): never {
  throw Object.assign(new Error(message), { status, statusCode: status })
}

/**
 * The commerce backend. With `trusted`, also the server-only methods
 * (orders, gift cards, store admin), as adapter-magento has them with its
 * Integration.
 */
export function createMageosDirectusBackend(client: Client, options: { trusted: boolean }): CommerceBackendAdapter {
  const catalogue = {
    async getProductsByCategory(ref: CategoryProductsRef) {
      const page = await call(client, commerce.products(ref.externalId
        ? { category: ref.externalId, limit: PAGE_SIZE }
        : { category_slug: ref.slug, limit: PAGE_SIZE }))
      return page.items.map(toStorefrontProduct)
    },
    async productSellers(skus: string[]) {
      const wanted = [...new Set(skus.filter(Boolean))].slice(0, 100)
      if (!wanted.length) return {}
      const sellers = await call(client, commerce.sellers(wanted))
      return Object.fromEntries(Object.entries(sellers).map(([sku, seller]) => [sku, { customerId: seller.customerId, name: seller.name }]))
    },
    async giftCardProducts() {
      return (await call(client, commerce.giftCardProducts())).map(toStorefrontProduct)
    },
  }

  if (!options.trusted) {
    return {
      ...catalogue,
      id: MAGEOS_BACKEND_ID,
      collections: ['products', 'orders'],
      isEnabled: () => true,
      async request({ collection, key, params }: DirectusRequestDescriptor) {
        if (collection === 'products') return key !== undefined ? productBySku(client, String(key)) : productList(client, params)
        // Orders are a customer's own, read server-side only.
        if (collection === 'orders') return key !== undefined ? null : []
        throw new Error(`magento (via Directus): unmapped collection "${collection}"`)
      },
    }
  }

  const customersOnly = (collection: string, verb: string) => {
    if (collection !== 'customers') refuse(`Can't ${verb} ${collection} here`, 405)
  }

  return {
    ...catalogue,
    id: MAGEOS_BACKEND_ID,
    collections: ['products', 'orders', 'customers', 'creditmemos'],
    isEnabled: () => true,
    async request({ collection, key, params }: DirectusRequestDescriptor) {
      if (ADMIN_COLLECTIONS.has(collection) && key === undefined) {
        return call(client, commerce.adminList(collection as 'orders' | 'customers' | 'creditmemos'))
      }
      if (collection === 'products') return key !== undefined ? productBySku(client, String(key)) : productList(client, params)
      if (collection === 'orders') return null
      throw new Error(`magento (via Directus): unmapped collection "${collection}"`)
    },

    placePaidOrder: (order: PaidOrder) => call(client, commerce.placePaidOrder(order)),
    customerOrders: (customerId: string, paging?: { page?: number, pageSize?: number }) =>
      call(client, commerce.customerOrders(customerId, { page: paging?.page ?? 1, limit: paging?.pageSize ?? 50 })),
    async customerOrder(customerId: string, orderId: string) {
      if (!/^\d+$/.test(orderId)) return null
      return orNull(call(client, commerce.customerOrder(customerId, orderId)))
    },
    receivedGiftCards: (email: string) => call(client, commerce.receivedGiftCards(email)),
    async purchasedGiftCards(customerId: string) {
      if (!/^\d+$/.test(customerId)) return []
      return call(client, commerce.customerGiftCards(customerId))
    },

    async schema(collection: string) {
      if (!ADMIN_COLLECTIONS.has(collection)) return null
      return call(client, commerce.adminSchema(collection as 'orders' | 'customers' | 'creditmemos'))
    },
    async create(collection: string, data: Record<string, unknown>) {
      customersOnly(collection, 'create')
      return call(client, commerce.adminCreateCustomer(data))
    },
    async update(collection: string, key: string | number, data: Record<string, unknown>) {
      customersOnly(collection, 'edit')
      return call(client, commerce.adminUpdateCustomer(String(key), data))
    },
    async remove(collection: string, key: string | number) {
      customersOnly(collection, 'delete')
      await call(client, commerce.adminDeleteCustomer(String(key)))
    },
    async adminOrder(orderId: string) {
      if (!/^\d+$/.test(orderId)) return null
      return orNull(call(client, commerce.adminOrder(orderId)))
    },
    orderByReference: (reference: string) => orNull(call(client, commerce.adminOrderByReference(reference))),
    refundOrder: (refund: BackendRefund) => call(client, commerce.refundOrder(refund)),
  }
}

const plainText = (html: unknown) =>
  String(html ?? '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim() || null

/** The store that sells integrations (@mframework/meeovi-integrations), as adapter-magento's integration-store.ts. */
export function createMageosDirectusIntegrationStore(client: Client) {
  return {
    id: MAGEOS_BACKEND_ID,

    async products(skus: string[]) {
      const wanted = [...new Set(skus.filter(Boolean))].slice(0, 100)
      if (!wanted.length) return []
      const listed = (await call(client, commerce.products({ sku: wanted, limit: wanted.length }))).items
      const items = await Promise.all(listed.map((item) => withDetail(client, item)))
      // The seller is display-only: products are still listed without one.
      const sellers = items.length
        ? await call(client, commerce.sellers(items.map((item) => item.sku))).catch(() => ({} as Record<string, BackendSeller>))
        : {} as Record<string, BackendSeller>
      return items.map((item) => {
        const seller = sellers[item.sku]
        const price = Number(item.price?.final ?? 0)
        return {
          sku: item.sku,
          ref: `${MAGEOS_BACKEND_ID}:${item.sku}`,
          name: item.name || item.sku,
          description: plainText(item.attributes?.shortDescription) || plainText(item.attributes?.description),
          price: Number.isFinite(price) && price > 0 ? price : 0,
          currency: item.price?.currency ?? null,
          image: item.images?.[0] ?? null,
          seller: seller ? { id: seller.customerId, name: seller.name } : null,
        }
      })
    },

    customerId(user: Record<string, unknown>): string | null {
      const id = Number(user?.magentoCustomerId)
      return Number.isInteger(id) && id > 0 ? String(id) : null
    },

    purchasedSkus: (customerId: string) => call(client, commerce.purchasedSkus(customerId)),
  }
}

/** better-auth signup → a Mage-OS customer (as adapter-magento's commerce-link.ts). */
export function createMageosDirectusCustomerLink(client: Client): CommerceCustomerLinker {
  return {
    id: MAGEOS_BACKEND_ID,
    isEnabled: () => true,
    async onUserCreated(user) {
      const [firstname, ...rest] = (user.name || 'Customer').trim().split(/\s+/)
      const created = await call(client, commerce.createCustomer({
        firstname: firstname || 'Customer',
        lastname: rest.join(' ') || firstname || 'Customer',
        email: user.email,
        wantsToSell: Boolean(user.isSeller),
      }))
      return created?.id ? { externalCustomerId: String(created.id) } : undefined
    },
  }
}
