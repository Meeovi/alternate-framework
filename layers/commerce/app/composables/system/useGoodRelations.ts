import type { SfProduct, SfImage, SfMoney } from '~/composables/system/models'

type GoodRelationsOfferInput = {
	name: string
	description?: string
	sku?: string
	image?: string | SfImage
	url?: string
	price?: number | SfMoney
	currency?: string
	availability?: 'InStock' | 'OutOfStock' | 'PreOrder' | 'Discontinued'
}

export function useGoodRelations() {
	function resolveImage(image?: string | SfImage): string | undefined {
		if (!image) return undefined
		if (typeof image === 'string') return image
		return image.url
	}

	function resolvePrice(price?: number | SfMoney): { amount: number; currency: string } {
		if (typeof price === 'number') return { amount: price, currency: 'USD' }
		if (price && typeof price === 'object') return { amount: price.amount || 0, currency: price.currency || 'USD' }
		return { amount: 0, currency: 'USD' }
	}

	function createProductJsonLd(input: GoodRelationsOfferInput) {
		const price = resolvePrice(input.price)
		const image = resolveImage(input.image)

		return {
			'@context': 'https://schema.org',
			'@type': 'Product',
			name: input.name,
			description: input.description,
			sku: input.sku,
			image,
			offers: {
				'@type': 'Offer',
				url: input.url,
				priceCurrency: input.currency || 'USD',
				price: price.amount,
				availability: `https://schema.org/${input.availability || 'InStock'}`,
			},
		}
	}

	function createProductWithVariantsJsonLd(product: SfProduct) {
		return {
			'@context': 'https://schema.org',
			'@type': 'Product',
			name: product.name,
			description: product.description,
			sku: product.sku,
			image: product.primaryImage?.url,
			offers: {
				'@type': 'Offer',
				priceCurrency: product.price?.value?.currency || 'USD',
				price: product.price?.value?.amount || 0,
				availability: product.extensionAttributes?.stockItem?.isInStock
					? 'https://schema.org/InStock'
					: 'https://schema.org/OutOfStock',
				url: product.urlPath,
			},
		}
	}

	function createBreadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
		return {
			'@context': 'https://schema.org',
			'@type': 'BreadcrumbList',
			itemListElement: items.map((item, index) => ({
				'@type': 'ListItem',
				position: index + 1,
				name: item.name,
				item: item.url,
			})),
		}
	}

	function createOrganizationJsonLd(data: {
		name: string
		url: string
		logo?: string
		contactPoint?: {
			telephone?: string
			contactType?: string
			email?: string
		}
	}) {
		return {
			'@context': 'https://schema.org',
			'@type': 'Organization',
			name: data.name,
			url: data.url,
			logo: data.logo,
			contactPoint: data.contactPoint ? {
				'@type': 'ContactPoint',
				telephone: data.contactPoint.telephone,
				contactType: data.contactPoint.contactType || 'customer service',
				email: data.contactPoint.email,
			} : undefined,
		}
	}

	function toScriptTag(data: unknown) {
		return `<script type="application/ld+json">${JSON.stringify(data)}</script>`
	}

	return {
		createProductJsonLd,
		createProductWithVariantsJsonLd,
		createBreadcrumbJsonLd,
		createOrganizationJsonLd,
		toScriptTag,
	}
}

export default useGoodRelations
