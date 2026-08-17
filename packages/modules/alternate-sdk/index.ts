import * as authModule from './src/auth/index.js'
import * as commerceModule from './src/commerce/index.js'
import * as searchModule from './src/search/index.js'
import * as contentModule from './src/content/index.js'
import * as federationModule from './src/federation/index.js'
import * as gatewayModule from './src/gateway/index.js'
import * as contractsModule from './src/contracts/index.js'
import * as notificationsModule from './src/notifications/index.js'
import * as localizationModule from './src/localization/index.js'
import * as socialModule from './src/social/index.js'
import { createGateway, createGatewayRegistry } from './src/gateway/index.js'
import { setDefaultAuthAdapter } from './src/contracts/auth.js'
import { setDefaultSearchAdapter } from './src/contracts/search.js'
import { setDefaultNotifyAdapter } from './src/contracts/notification.js'

type APISource = {
  name: string
  type: string
  endpoint: string
  headers?: Record<string, string>
}

class GatewayAdapter {
  constructor(opts: { sources: APISource[] }) {
    void opts
  }

  executeRequest(): Promise<any> {
    throw new Error('GatewayAdapter not implemented.')
  }
}

export const sdk: Record<string, any> = {
	auth: {},
	commerce: {},
	search: {},
	content: {},
	federation: {},
	gateway: gatewayModule,
	contracts: contractsModule,
	notifications: notificationsModule,
	localization: localizationModule,
	media: {},
	notify: notificationsModule,
	social: {},
}

export function initGateway(nuxtApp: any) {
	try {
		const registry = createGatewayRegistry()

		const publicConfig = (nuxtApp.$config?.public || {}) as Record<string, any>
		const gatewayConfig: Record<string, any> = {}

		const directus = publicConfig.directus
		if (directus?.url) {
			gatewayConfig.content = {
				provider: 'directus',
				url: directus.url,
				token: directus.token || directus.staticToken || directus.auth?.token,
			}
		}

		if (publicConfig.social?.provider) {
			gatewayConfig.social = {
				provider: publicConfig.social.provider,
			}
		}

		const gateway = createGateway(gatewayConfig, registry)

		if (gateway.content) {
			sdk.content = gateway.content
			setDefaultSearchAdapter(gateway.content as any)
		}
		if (gateway.auth) {
			sdk.auth = gateway.auth
			setDefaultAuthAdapter(gateway.auth as any)
		}
		if (gateway.commerce) sdk.commerce = gateway.commerce
		if (gateway.search) {
			sdk.search = gateway.search
			setDefaultSearchAdapter(gateway.search as any)
		}
		if (gateway.federation) sdk.federation = gateway.federation
		if (gateway.notifications) {
			sdk.notifications = gateway.notifications
			setDefaultNotifyAdapter(gateway.notifications as any)
		}
		if (gateway.localization) sdk.localization = gateway.localization
		if (gateway.media) sdk.media = gateway.media
		if (gateway.social) sdk.social = gateway.social
	} catch {}
}

export function initDynamicGateway(env: Record<string, string | undefined> = {}): any {
	const sources: APISource[] = []

	if (sources.length === 0 && env.DIRECTUS_URL) {
		sources.push({
			name: 'cms',
			type: 'rest',
			endpoint: env.DIRECTUS_URL,
			headers: { Authorization: `Bearer ${env.DIRECTUS_STATIC_TOKEN || ''}` }
		})
	}

	return new GatewayAdapter({ sources })
}

export {
	authModule as auth,
	commerceModule as commerce,
	searchModule as search,
	contentModule as content,
	federationModule as federation,
	gatewayModule as gateway,
	contractsModule as contracts,
	notificationsModule as notifications,
	localizationModule as localization,
	socialModule as social,
}

export { getServerAuth, useAuth } from './src/auth/server.js'
export { useSearch, getServerSearchAdapter } from './src/search/server.js'
export { useNotify, useNotificationsAdapter } from './src/notifications/adapter.js'

export { AuthAdapterRegistry, registerAuthAdapter, setDefaultAuthAdapter } from './src/contracts/auth.js'
export { SearchAdapterRegistry, registerSearchAdapter, setDefaultSearchAdapter } from './src/contracts/search.js'
export { NotifyAdapterRegistry, registerNotifyAdapter, setDefaultNotifyAdapter } from './src/contracts/notification.js'
export { SocialDriverRegistry, registerSocialDriver, setDefaultSocialDriver } from './src/contracts/social.js'
export { CommerceDriverRegistry, registerCommerceDriver, setDefaultCommerceDriver } from './src/contracts/commerce.js'
export { CommerceBackendRegistry, registerCommerceBackendAdapter } from './src/contracts/commerce-backend.js'
export type { CommerceBackendAdapter, DirectusRequestDescriptor } from './src/contracts/commerce-backend.js'
export { CommerceCustomerLinkRegistry, registerCommerceCustomerLinker } from './src/contracts/commerce-customer-link.js'
export type { CommerceCustomerLinker } from './src/contracts/commerce-customer-link.js'
export { ContentAdapterRegistry, registerContentAdapter, getContentAdapter } from './src/contracts/content.js'
export type { ContentAdapter, ContentChangeEvent, DynamicSchemaField, MediaFolder } from './src/contracts/content.js'