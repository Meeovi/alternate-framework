type ProductLike = {
	id?: string | number
	sku?: string | number
	slug?: string
	url?: string
}

function toKey(product: ProductLike) {
	return product.id || product.sku || product.slug || null
}

export function useNextPreviousProductLinks() {
	function getAdjacentProducts(products: ProductLike[], currentId: string | number) {
		const index = products.findIndex((product) => String(toKey(product)) === String(currentId))
		if (index < 0) return { previous: null, next: null }

		return {
			previous: index > 0 ? products[index - 1] : null,
			next: index < products.length - 1 ? products[index + 1] : null,
		}
	}

	function getLinks(products: ProductLike[], currentId: string | number) {
		const adjacent = getAdjacentProducts(products, currentId)
		return {
			previous: adjacent.previous ? adjacent.previous.url || null : null,
			next: adjacent.next ? adjacent.next.url || null : null,
		}
	}

	return {
		getAdjacentProducts,
		getLinks,
	}
}

export default useNextPreviousProductLinks
