import { getSellerProvider } from './registry'
import mockProvider from './mockProvider'

function resolveProvider() {
	const p = getSellerProvider()
	return p || mockProvider
}

export default function useAffiliates() {
	const provider: any = resolveProvider()

	async function generateAffiliateLink(sellerId: string, productId: string, params?: Record<string, string>) {
		if (provider && typeof provider.generateAffiliateLink === 'function') {
			return provider.generateAffiliateLink(sellerId, productId, params)
		}
		// Best-effort: return a predictable affiliate URL when provider doesn't support it
		const q = params ? `?${new URLSearchParams(params).toString()}` : ''
		return `${process.env.STORE_URL || ''}/affiliate/${encodeURIComponent(sellerId)}/product/${encodeURIComponent(productId)}${q}`
	}

	async function trackReferral(affiliateId: string, data: Record<string, any>) {
		if (provider && typeof provider.trackReferral === 'function') return provider.trackReferral(affiliateId, data)
		try {
			if (mockProvider && typeof mockProvider.trackReferral === 'function') return mockProvider.trackReferral(affiliateId, data)
			// best-effort no-op
			console.warn('No affiliate tracking provider available; skipping')
		} catch (e) {
			console.error('Failed to track referral', e)
		}
	}

	async function getReferrals(affiliateId: string, params?: Record<string, any>) {
		if (provider && typeof provider.getReferrals === 'function') return provider.getReferrals(affiliateId, params)
		if (mockProvider && typeof mockProvider.getReferrals === 'function') return mockProvider.getReferrals(affiliateId, params)
		return []
	}

	return { generateAffiliateLink, trackReferral, getReferrals }
}

export { useAffiliates }
