import { useRuntimeConfig } from '#imports'

type AnyRecord = Record<string, any>
type MaybeFn = ((...args: any[]) => any) | undefined

function resolveGatewayContent(): AnyRecord | null {
	const runtime = globalThis as AnyRecord
	const gatewayFactory = runtime.useGateway as MaybeFn

	if (typeof gatewayFactory !== 'function') {
		return null
	}

	try {
		const gateway = gatewayFactory() as AnyRecord
		return (gateway?.content as AnyRecord) || null
	} catch {
		return null
	}
}

function resolveGatewayCommerce(): AnyRecord | null {
	const runtime = globalThis as AnyRecord
	const gatewayFactory = runtime.useGateway as MaybeFn

	if (typeof gatewayFactory !== 'function') {
		return null
	}

	try {
		const gateway = gatewayFactory() as AnyRecord
		return (gateway?.commerce as AnyRecord) || null
	} catch {
		return null
	}
}

function resolveRequestApi(): AnyRecord {
	const runtime = globalThis as AnyRecord
	const requestFactory = runtime.useContentRequest as MaybeFn

	if (typeof requestFactory !== 'function') {
		return {}
	}

	try {
		return (requestFactory() as AnyRecord) || {}
	} catch {
		return {}
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

function buildSocialFeedLink(product?: AnyRecord, input: AnyRecord = {}) {
	const publicConfig = (useRuntimeConfig().public || {}) as AnyRecord
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

	const normalizedPath = feedPath.startsWith('/') ? feedPath : `/${feedPath}`
	const baseLink = baseUrl ? `${baseUrl}${normalizedPath}` : normalizedPath

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

function normalizeDotdigitalChatConfig(value: AnyRecord | null) {
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

export default function useContentAdapter(): AnyRecord {
	const request = resolveRequestApi()
	const content = resolveGatewayContent()
	const commerce = resolveGatewayCommerce()

	const call = async (method: string, ...args: any[]) => {
		const fromRequest = request?.[method]
		if (typeof fromRequest === 'function') return fromRequest(...args)

		const fromContent = content?.[method]
		if (typeof fromContent === 'function') return fromContent(...args)

		return undefined
	}

	const readItems = async (...args: any[]) => call('readItems', ...args)
	const readItem = async (...args: any[]) => call('readItem', ...args)
	const readFieldsByCollection = async (...args: any[]) => call('readFieldsByCollection', ...args)
	const createItems = async (...args: any[]) => call('createItems', ...args)
	const createItem = async (...args: any[]) => call('createItem', ...args)
	const updateItems = async (...args: any[]) => call('updateItems', ...args)
	const updateItem = async (...args: any[]) => call('updateItem', ...args)
	const deleteItems = async (...args: any[]) => call('deleteItems', ...args)
	const deleteItem = async (...args: any[]) => call('deleteItem', ...args)
	const uploadFiles = async (...args: any[]) => call('uploadFiles', ...args)

	const getAssetUrl = (file: unknown) => {
		const fn = request?.getAssetUrl ?? content?.getAssetUrl
		return typeof fn === 'function' ? fn(file) : ''
	}

	const requestFn = async (...args: any[]) => call('request', ...args)

	const readFirstAvailable = async (collections: string[], opts: AnyRecord = {}) => {
		for (const collection of collections) {
			const result = await readItems(collection, opts)
			if (Array.isArray(result) && result.length) return result
			if (Array.isArray(result?.data) && result.data.length) return result.data
		}
		return []
	}

	const listShops = async (params: AnyRecord = {}) => {
		const remote = commerce?.listShops ?? commerce?.getShops ?? content?.listShops
		if (typeof remote === 'function') return remote(params)
		return readFirstAvailable(['shops', 'stores', 'store_locations'], params)
	}

	const listBrands = async (params: AnyRecord = {}) => {
		const remote = commerce?.listBrands ?? commerce?.getBrands ?? content?.listBrands
		if (typeof remote === 'function') return remote(params)
		return readFirstAvailable(['brands', 'manufacturers', 'collections'], params)
	}

	const getBrandBySlug = async (slug: string) => {
		const fromRemote = commerce?.getBrandBySlug ?? content?.getBrandBySlug
		if (typeof fromRemote === 'function') return fromRemote(slug)

		const target = normalizeSlug(slug)
		for (const collection of ['brands', 'manufacturers', 'collections']) {
			const matches = await readItems(collection, {
				filter: {
					slug: {
						_eq: slug,
					},
				},
				limit: 1,
			})

			if (Array.isArray(matches) && matches.length) return matches[0]
			if (Array.isArray(matches?.data) && matches.data.length) return matches.data[0]
		}

		const brands = await listBrands()
		if (!Array.isArray(brands)) return null

		return brands.find((brand: AnyRecord) => normalizeSlug(brand?.slug || brand?.name || brand?.title) === target) || null
	}

	const getPage = async (id: string, opts: AnyRecord = {}) => {
		const fromRemote = content?.getPage ?? commerce?.getPage ?? commerce?.getCmsPage ?? commerce?.getPageBySlug
		if (typeof fromRemote === 'function') return fromRemote(id, opts)

		for (const collection of ['pages', 'cms_pages', 'content_pages']) {
			const byId = await readItem(collection, id, opts)
			if (byId) return byId

			const bySlug = await readItems(collection, {
				...opts,
				filter: {
					slug: { _eq: id },
				},
				limit: 1,
			})

			if (Array.isArray(bySlug) && bySlug.length) return bySlug[0]
			if (Array.isArray(bySlug?.data) && bySlug.data.length) return bySlug.data[0]
		}

		return null
	}

	const getBrandBar = async () => {
		const fromRemote = content?.getBrandBar ?? commerce?.getBrandBar
		if (typeof fromRemote === 'function') return fromRemote()

		const bars = await readFirstAvailable(['brand_bar', 'brand_bars', 'menus'], { limit: 1 })
		return Array.isArray(bars) && bars.length ? bars[0] : { name: '', menus: [] }
	}

	const getContentPage = async (slug?: string) => {
		const fromRemote = content?.getContentPage ?? commerce?.getContentPage
		if (typeof fromRemote === 'function') return fromRemote(slug)

		const page = slug ? await getPage(slug) : null
		return page || { title: '', body: '' }
	}

	const getDotdigitalChatConfig = async (opts: AnyRecord = {}) => {
		const methodNames = [
			'getDotdigitalChatConfig',
			'getDotdigitalChat',
			'getChatConfig',
			'getChatWidget',
			'getDotdigitalChatWidget',
		]

		for (const source of [content, commerce]) {
			for (const method of methodNames) {
				const fn = source?.[method]
				if (typeof fn === 'function') {
					const result = await fn(opts)
					return normalizeDotdigitalChatConfig(result)
				}
			}
		}

		for (const collection of ['dotdigital_chat', 'dotdigital_chat_widgets', 'chat_widgets', 'site_settings', 'global_settings']) {
			const result = await readItems(collection, {
				...opts,
				limit: 1,
			})
			const records = Array.isArray(result) ? result : result?.data
			if (Array.isArray(records) && records.length) {
				const item = records[0] as AnyRecord
				const provider = String(item?.provider || item?.service || '').toLowerCase()
				if (!provider || provider.includes('dotdigital') || collection.startsWith('dotdigital')) {
					return normalizeDotdigitalChatConfig(item)
				}
			}
		}

		return null
	}

	const getProductRssFeeds = async (product: AnyRecord, opts: AnyRecord = {}) => {
		const methodNames = [
			'getProductRssFeeds',
			'listProductFeeds',
			'getProductFeeds',
		]

		for (const source of [content, commerce]) {
			for (const method of methodNames) {
				const fn = source?.[method]
				if (typeof fn === 'function') {
					const result = await fn(product, opts)
					if (Array.isArray(result) && result.length) return result
				}
			}
		}

		for (const source of [content, commerce]) {
			const fn = source?.getProductFeedLink
			if (typeof fn === 'function') {
				const link = await fn(product, opts)
				if (link) {
					return [{
						title: `${product?.name || product?.title || product?.sku || 'Product'} RSS Feed`,
						link,
						type: 'product',
					}]
				}
			}
		}

		const feeds: Array<AnyRecord> = []

		if (product?.rss_link) {
			feeds.push({
				title: `${product?.name || product?.title || product?.sku || 'Product'} RSS Feed`,
				link: product.rss_link,
				type: 'product',
			})
		}

		feeds.push(buildSocialFeedLink(product, opts))

		return feeds.filter((entry) => Boolean(entry?.link))
	}

	const getProductRssLink = async (product: AnyRecord, opts: AnyRecord = {}) => {
		const feeds = await getProductRssFeeds(product, opts)
		return Array.isArray(feeds) && feeds.length ? feeds[0].link : null
	}

	return {
		request: requestFn,
		readItems,
		readItem,
		readFieldsByCollection,
		createItems,
		createItem,
		updateItems,
		updateItem,
		deleteItems,
		deleteItem,
		uploadFiles,
		getAssetUrl,
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
