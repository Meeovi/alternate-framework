type GoodRelationsOfferInput = {
	name: string
	description?: string
	sku?: string
	image?: string
	url?: string
	price?: number
	currency?: string
	availability?: 'InStock' | 'OutOfStock' | 'PreOrder'
}

export function useGoodRelations() {
	function createProductJsonLd(input: GoodRelationsOfferInput) {
		return {
			'@context': 'https://schema.org',
			'@type': 'Product',
			name: input.name,
			description: input.description,
			sku: input.sku,
			image: input.image,
			offers: {
				'@type': 'Offer',
				url: input.url,
				priceCurrency: input.currency || 'USD',
				price: input.price,
				availability: `https://schema.org/${input.availability || 'InStock'}`,
			},
		}
	}

	function toScriptTag(data: unknown) {
		return `<script type="application/ld+json">${JSON.stringify(data)}</script>`
	}

	return {
		createProductJsonLd,
		toScriptTag,
	}
}

export default useGoodRelations
