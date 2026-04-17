import { ref } from 'vue'

type AdsPayload = Record<string, unknown>

export type AdsProvider = {
	trackEvent?: (event: string, payload?: AdsPayload) => void | Promise<void>
	trackPageView?: (path?: string) => void | Promise<void>
	setConsent?: (granted: boolean) => void | Promise<void>
}

const providers: Record<string, AdsProvider> = {}

export function registerAdsProvider(name: string, provider: AdsProvider) {
	providers[name] = provider
}

export function unregisterAdsProvider(name: string) {
	delete providers[name]
}

export function useAds() {
	const consentGranted = ref(false)

	async function trackEvent(event: string, payload: AdsPayload = {}) {
		if (!consentGranted.value) return
		await Promise.all(
			Object.values(providers).map(async (provider) => {
				if (typeof provider.trackEvent === 'function') {
					await provider.trackEvent(event, payload)
				}
			}),
		)
	}

	async function trackPageView(path?: string) {
		if (!consentGranted.value) return
		const pagePath = path || (typeof window !== 'undefined' ? window.location.pathname : '/')
		await Promise.all(
			Object.values(providers).map(async (provider) => {
				if (typeof provider.trackPageView === 'function') {
					await provider.trackPageView(pagePath)
				}
			}),
		)
	}

	async function setConsent(granted: boolean) {
		consentGranted.value = granted
		await Promise.all(
			Object.values(providers).map(async (provider) => {
				if (typeof provider.setConsent === 'function') {
					await provider.setConsent(granted)
				}
			}),
		)
	}

	return {
		consentGranted,
		registerAdsProvider,
		unregisterAdsProvider,
		trackEvent,
		trackPageView,
		setConsent,
	}
}

export default useAds
