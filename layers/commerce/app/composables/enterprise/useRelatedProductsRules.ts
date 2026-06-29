import { getCommerceClient } from '../../utils/client'
import type { SfProductLink, SfProductLinkType } from '~/composables/system/models'

export function useRelatedProductsRules() {
	const client = getCommerceClient()

	async function getRelatedProductsRules(productId: string): Promise<SfProductLink[]> {
		if (client && typeof client.getRelatedProductsRules === 'function') {
			return client.getRelatedProductsRules(productId) as Promise<SfProductLink[]>
		}
		return []
	}

	async function addProductLink(productId: string, linkedProductId: string, linkType: SfProductLinkType) {
		if (client && typeof client.addProductLink === 'function') {
			return client.addProductLink(productId, linkedProductId, linkType)
		}
		return { success: false, reason: 'Not implemented' }
	}

	async function removeProductLink(linkId: string) {
		if (client && typeof client.removeProductLink === 'function') {
			return client.removeProductLink(linkId)
		}
		return { success: false, reason: 'Not implemented' }
	}

	return {
		getRelatedProductsRules,
		addProductLink,
		removeProductLink,
	}
}

export default useRelatedProductsRules
