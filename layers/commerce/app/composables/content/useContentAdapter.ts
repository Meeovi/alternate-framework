import { getCommerceClient } from '../../utils/client'
import useContentRequest from './useContentRequest'

function clientOrNull() {
  try {
    return getCommerceClient() as any
  } catch {
    return null
  }
}

function normalizeSlug(value: unknown) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function normalizeSiteUrl(value: unknown) {
  return String(value || '').replace(/\/$/, '')
}

function buildSocialFeedLink(product?: Record<string, any>, input: Record<string, any> = {}) {
  const publicConfig = useRuntimeConfig().public || {}
  const baseUrl = normalizeSiteUrl(publicConfig.siteUrl || publicConfig.appUrl || input.siteUrl || '')
  const feedPath = String(input.feedPath || publicConfig.feedPath || '/feed.xml')
  const feedCollection = String(input.collection || publicConfig.feedCollection || 'posts')
  const identity = String(
    input.identity
      || product?.slug
      || product?.url_key
      || product?.sku
      || product?.id
      || publicConfig.feedIdentity
      || '',
  )

  const baseLink = `${baseUrl}${feedPath.startsWith('/') ? feedPath : `/${feedPath}`}` || feedPath
  if (!identity) {
    return {
      title: 'Social RSS Feed',
      link: baseLink,
      identity: '',
      collection: feedCollection,
      type: 'social',
    }
  }

  const separator = baseLink.includes('?') ? '&' : '?'
  return {
    title: `${product?.name || product?.title || product?.sku || 'Product'} RSS Feed`,
    link: `${baseLink}${separator}identity=${encodeURIComponent(identity)}&collection=${encodeURIComponent(feedCollection)}`,
    identity,
    collection: feedCollection,
    type: 'product-social',
  }
}

function normalizeDotdigitalChatConfig(value: Record<string, any> | null) {
  if (!value) return null

  const status = String(value.status || '').toLowerCase()
  const enabled = Boolean(value.enabled ?? value.active ?? (!status || ['published', 'active', 'live'].includes(status)))

  return {
    provider: 'dotdigital',
    enabled,
    websiteId: value.websiteId ?? value.website_id ?? value.accountId ?? value.account_id ?? null,
    chatId: value.chatId ?? value.chat_id ?? value.widgetId ?? value.widget_id ?? null,
    scriptUrl: value.scriptUrl ?? value.script_url ?? value.src ?? value.url ?? null,
    launcherUrl: value.launcherUrl ?? value.launcher_url ?? value.chatUrl ?? value.chat_url ?? value.href ?? null,
    environment: value.environment ?? value.region ?? null,
    raw: value,
  }
}

export function useContentAdapter(): any {
  const client = clientOrNull()
  const request = useContentRequest()

  async function readFirstAvailable(collections: string[], opts: Record<string, any> = {}) {
    for (const collection of collections) {
      const result = await request.readItems(collection, opts)
      if (Array.isArray(result) && result.length) return result
    }
    return []
  }

  async function listShops(params: Record<string, unknown> = {}) {
    if (client && typeof client.listShops === 'function') return client.listShops(params)
    if (client && typeof client.getShops === 'function') return client.getShops(params)
    return readFirstAvailable(['shops', 'stores', 'store_locations'], params as Record<string, any>)
  }

  async function listBrands(params: Record<string, unknown> = {}) {
    if (client && typeof client.listBrands === 'function') return client.listBrands(params)
    if (client && typeof client.getBrands === 'function') return client.getBrands(params)
    return readFirstAvailable(['brands', 'manufacturers', 'collections'], params as Record<string, any>)
  }

  async function getBrandBySlug(slug: string) {
    if (client && typeof client.getBrandBySlug === 'function') return client.getBrandBySlug(slug)

    const target = normalizeSlug(slug)
    for (const collection of ['brands', 'manufacturers', 'collections']) {
      const matches = await request.readItems(collection, {
        filter: {
          slug: {
            _eq: slug,
          },
        },
        limit: 1,
      })

      if (Array.isArray(matches) && matches.length) return matches[0]
    }

    const brands = await listBrands()
    return Array.isArray(brands)
      ? brands.find((brand: Record<string, any>) => normalizeSlug(brand?.slug || brand?.name || brand?.title) === target) || null
      : null
  }

  async function getPage(id: string, opts: Record<string, unknown> = {}) {
    if (client && typeof client.getPage === 'function') return client.getPage(id, opts)
    if (client && typeof client.getCmsPage === 'function') return client.getCmsPage(id, opts)
    if (client && typeof client.getPageBySlug === 'function') return client.getPageBySlug(id, opts)

    for (const collection of ['pages', 'cms_pages', 'content_pages']) {
      const byId = await request.readItem(collection, id, opts)
      if (byId) return byId

      const bySlug = await request.readItems(collection, {
        ...opts,
        filter: {
          slug: { _eq: id },
        },
        limit: 1,
      })
      if (Array.isArray(bySlug) && bySlug.length) return bySlug[0]
    }

    return null
  }

  async function getBrandBar() {
    if (client && typeof client.getBrandBar === 'function') return client.getBrandBar()
    const bars = await readFirstAvailable(['brand_bar', 'brand_bars', 'menus'], { limit: 1 })
    return Array.isArray(bars) && bars.length ? bars[0] : { name: '', menus: [] }
  }

  async function getContentPage(slug?: string) {
    const page = slug ? await getPage(slug) : null
    return page || { title: '', body: '' }
  }

  async function getDotdigitalChatConfig(opts: Record<string, unknown> = {}) {
    const methodNames = [
      'getDotdigitalChatConfig',
      'getDotdigitalChat',
      'getChatConfig',
      'getChatWidget',
      'getDotdigitalChatWidget',
    ]

    for (const method of methodNames) {
      if (client && typeof client[method] === 'function') {
        const result = await client[method](opts)
        return normalizeDotdigitalChatConfig(result)
      }
    }

    for (const collection of ['dotdigital_chat', 'dotdigital_chat_widgets', 'chat_widgets', 'site_settings', 'global_settings']) {
      const result = await request.readItems(collection, {
        ...opts,
        limit: 1,
      })
      if (Array.isArray(result) && result.length) {
        const item = result[0] as Record<string, any>
        const provider = String(item?.provider || item?.service || '').toLowerCase()
        if (!provider || provider.includes('dotdigital') || collection.startsWith('dotdigital')) {
          return normalizeDotdigitalChatConfig(item)
        }
      }
    }

    return null
  }

  async function getProductRssFeeds(product: Record<string, any>, opts: Record<string, unknown> = {}) {
    const methodNames = [
      'getProductRssFeeds',
      'listProductFeeds',
      'getProductFeeds',
    ]

    for (const method of methodNames) {
      if (client && typeof client[method] === 'function') {
        const result = await client[method](product, opts)
        if (Array.isArray(result) && result.length) return result
      }
    }

    if (client && typeof client.getProductFeedLink === 'function') {
      const link = await client.getProductFeedLink(product, opts)
      if (link) {
        return [{
          title: `${product?.name || product?.title || product?.sku || 'Product'} RSS Feed`,
          link,
          type: 'product',
        }]
      }
    }

    const feeds: Array<Record<string, any>> = []

    if (product?.rss_link) {
      feeds.push({
        title: `${product?.name || product?.title || product?.sku || 'Product'} RSS Feed`,
        link: product.rss_link,
        type: 'product',
      })
    }

    feeds.push(buildSocialFeedLink(product, opts as Record<string, any>))

    return feeds.filter((entry) => Boolean(entry?.link))
  }

  async function getProductRssLink(product: Record<string, any>, opts: Record<string, unknown> = {}) {
    const feeds = await getProductRssFeeds(product, opts)
    return Array.isArray(feeds) && feeds.length ? feeds[0].link : null
  }

  return {
    listShops,
    listBrands,
    getBrandBySlug,
    getPage,
    getBrandBar,
    getContentPage,
    getDotdigitalChatConfig,
    getProductRssFeeds,
    getProductRssLink,
  }
}

export default useContentAdapter
