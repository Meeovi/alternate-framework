import type { SocialDriverContract } from '../contracts/social.js'
import { SocialDriverRegistry } from '../contracts/social.js'
import SocialMeshDriver from './driver.js'

function resolveGatewaySocial(): SocialDriverContract {
	const runtime = globalThis as Record<string, any>
	const gatewayFactory = runtime.useGateway

	if (typeof gatewayFactory !== 'function') {
		return {} as SocialDriverContract
	}

	try {
		const gateway = gatewayFactory() as Record<string, any>
		return (gateway?.social as SocialDriverContract) || {}
	} catch {
		return {} as SocialDriverContract
	}
}

export function useSocialAdapter(): SocialDriverContract {
	const gatewaySocial = resolveGatewaySocial()
	const meshDriver = new SocialMeshDriver()

	return {
		...meshDriver,
		...gatewaySocial,
		posts: { ...meshDriver.posts, ...gatewaySocial?.posts },
		comments: { ...meshDriver.comments, ...gatewaySocial?.comments },
		feed: { ...meshDriver.feed, ...gatewaySocial?.feed },
		spaces: { ...meshDriver.spaces, ...gatewaySocial?.spaces },
		vibez: { ...meshDriver.vibez, ...gatewaySocial?.vibez },
	}
}

const socialRegistry = new Map<string, SocialDriverContract>()
let defaultSocialAdapter: SocialDriverContract | undefined

export function registerSocialAdapter(name: string, adapter: SocialDriverContract): void {
	socialRegistry.set(name, adapter)
	SocialDriverRegistry.register(name, adapter)
}

export function getSocialAdapter(name?: string): SocialDriverContract | undefined {
	if (name) return socialRegistry.get(name)
	return defaultSocialAdapter
}

export function setDefaultSocialAdapter(adapter: SocialDriverContract): void {
	defaultSocialAdapter = adapter
	SocialDriverRegistry.setDefaultDriver(adapter)
}

export const useSocial = (): SocialDriverContract => {
	if (defaultSocialAdapter) {
		return defaultSocialAdapter
	}
	return useSocialAdapter()
}

export { SocialDriverRegistry } from '../contracts/social.js'