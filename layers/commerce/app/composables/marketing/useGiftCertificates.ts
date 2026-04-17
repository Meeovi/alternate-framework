import { getCommerceClient } from '../../utils/client'

function clientOrNull() {
	try {
		return getCommerceClient() as any
	} catch {
		return null
	}
}

export function useGiftCertificates() {
	const client = clientOrNull()

	async function listGiftCertificates(opts: Record<string, unknown> = {}) {
		if (client && typeof client.listGiftCards === 'function') return client.listGiftCards(opts)
		if (client && typeof client.listGiftCertificates === 'function') return client.listGiftCertificates(opts)
		return []
	}

	async function applyGiftCertificate(code: string, cartId?: string) {
		if (client && typeof client.applyGiftCard === 'function') return client.applyGiftCard({ code, cartId })
		if (client && typeof client.applyGiftCertificate === 'function') return client.applyGiftCertificate({ code, cartId })
		return { success: false, reason: 'applyGiftCertificate not implemented by provider' }
	}

	return {
		listGiftCertificates,
		applyGiftCertificate,
	}
}

export default useGiftCertificates
