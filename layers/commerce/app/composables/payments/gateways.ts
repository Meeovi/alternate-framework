import { getCommerceClient } from '../../utils/client'

export type PaymentGateway = {
	code: string
	title?: string
	isActive?: boolean
	[key: string]: unknown
}

const localGateways: Record<string, PaymentGateway> = {}

function clientOrNull() {
	try {
		return getCommerceClient() as any
	} catch {
		return null
	}
}

export function registerGateway(gateway: PaymentGateway) {
	localGateways[gateway.code] = gateway
}

export function unregisterGateway(code: string) {
	delete localGateways[code]
}

export function usePaymentGateways() {
	const client = clientOrNull()

	async function listGateways() {
		if (client && typeof client.listPaymentGateways === 'function') return client.listPaymentGateways()
		if (client && typeof client.listPayments === 'function') return client.listPayments()
		return Object.values(localGateways)
	}

	async function getGateway(code: string) {
		if (client && typeof client.getPaymentGateway === 'function') return client.getPaymentGateway(code)
		return localGateways[code] || null
	}

	return {
		listGateways,
		getGateway,
	}
}

export default usePaymentGateways
