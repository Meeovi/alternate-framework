// Adapter loader for runtime backend selection
import type { Gateway } from '../../../contracts/gateway'
import { directusAuthAdapter } from '../../../../../packages/adapters/adapter-directus/auth'
// import { magentoAuthAdapter } from '~/packages/adapters/adapter-magento/auth'
// import { supabaseAuthAdapter } from '~/packages/adapters/adapter-supabase/auth'

export function useGateway(): Gateway {
	const config = useRuntimeConfig()
	const backend = (config.public.backend || 'directus') as keyof typeof adapters

	const adapters = {
		directus: { auth: directusAuthAdapter },
		// magento: { auth: magentoAuthAdapter },
		// supabase: { auth: supabaseAuthAdapter },
	} satisfies Record<string, Gateway>

	return adapters[backend]
}
