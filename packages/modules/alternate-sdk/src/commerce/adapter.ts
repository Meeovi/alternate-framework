import useContentAdapter from '../content/adapter.js'

type AnyRecord = Record<string, any>

function resolveGatewayCommerce(): AnyRecord {
	const runtime = globalThis as AnyRecord
	const gatewayFactory = runtime.useGateway

	if (typeof gatewayFactory !== 'function') {
		return {}
	}

	try {
		const gateway = gatewayFactory() as AnyRecord
		return (gateway?.commerce as AnyRecord) || {}
	} catch {
		return {}
	}
}

export default function useCommerceAdapter(): AnyRecord {
	const commerce = resolveGatewayCommerce()
	const content = useContentAdapter()

	const getProductPrice = async (args: AnyRecord = {}) => {
		const fn = commerce?.getProductPrice
		if (typeof fn === 'function') return fn(args)
		return { pricing: null }
	}

	const getCatalogPriceRules = async (args: AnyRecord = {}) => {
		const fn = commerce?.getCatalogPriceRules
		if (typeof fn === 'function') return fn(args)
		return { rules: [] }
	}

	const getCartPriceRules = async (args: AnyRecord = {}) => {
		const fn = commerce?.getCartPriceRules
		if (typeof fn === 'function') return fn(args)
		return { rules: [] }
	}

	const getBrandBar = async (args: AnyRecord = {}) => content.getBrandBar(args)

	const getContentPage = async (args: AnyRecord = {}) => (
		content.getContentPage(args?.slug || args?.id)
	)

	const getDotdigitalChatConfig = async (args: AnyRecord = {}) => (
		content.getDotdigitalChatConfig(args)
	)

	const getProductRssFeeds = async (args: AnyRecord = {}) => (
		content.getProductRssFeeds(args?.product || {}, args)
	)

	const getProductRssLink = async (args: AnyRecord = {}) => ({
		link: await content.getProductRssLink(args?.product || {}, args),
	})

	const getBrands = async () => {
		if (typeof commerce?.getBrands === 'function') return commerce.getBrands()
		if (typeof content?.listBrands === 'function') return content.listBrands()
		return []
	}

	const getMeeBrands = async () => {
		if (typeof commerce?.getMeeBrands === 'function') return commerce.getMeeBrands()
		return []
	}

	return {
		...commerce,
		...content,
		getProductPrice,
		getCatalogPriceRules,
		getCartPriceRules,
		getBrandBar,
		getContentPage,
		getDotdigitalChatConfig,
		getProductRssFeeds,
		getProductRssLink,
		getBrands,
		getMeeBrands,
	}
}
