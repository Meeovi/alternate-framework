import { getSellerProvider } from './registry'
import mockProvider from './mockProvider'

function resolveProvider() {
	const p = getSellerProvider()
	return p || mockProvider
}

export default function useCommission() {
	const provider: any = resolveProvider()

	async function getCommissionRate(sellerId: string) {
		if (provider && typeof provider.getCommissionRate === 'function') return provider.getCommissionRate(sellerId)
		if (mockProvider && typeof mockProvider.getCommissionRate === 'function') return mockProvider.getCommissionRate(sellerId)
		return 0.1
	}

	async function setCommissionRate(sellerId: string, rate: number) {
		if (provider && typeof provider.setCommissionRate === 'function') return provider.setCommissionRate(sellerId, rate)
		if (mockProvider && typeof mockProvider.setCommissionRate === 'function') return mockProvider.setCommissionRate(sellerId, rate)
		throw new Error('No commission provider available')
	}

	async function calculateCommission(sellerId: string, amount: number) {
		const rate = await getCommissionRate(sellerId)
		return amount * rate
	}

	return { getCommissionRate, setCommissionRate, calculateCommission }
}

export { useCommission }
