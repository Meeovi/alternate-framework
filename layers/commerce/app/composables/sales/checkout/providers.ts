export type CheckoutProvider = {
	createCheckout?: (input?: any) => Promise<any>
	getCheckout?: (id: string) => Promise<any>
	updateCheckout?: (id: string, input: any) => Promise<any>
	completeCheckout?: (id: string) => Promise<any>
}

const providers: Record<string, CheckoutProvider> = {}

export function registerCheckoutProvider(name: string, provider: CheckoutProvider) {
	providers[name] = provider
}

export function getCheckoutProvider(name = 'default') {
	const provider = providers[name]
	if (!provider) throw new Error(`Checkout provider "${name}" not found`)
	return provider
}

export function getCheckoutProviders() {
	return { ...providers }
}

export function clearCheckoutProviders() {
	Object.keys(providers).forEach((key) => {
		delete providers[key]
	})
}

export default getCheckoutProvider
