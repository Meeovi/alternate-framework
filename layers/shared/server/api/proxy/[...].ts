import { joinURL } from 'ufo'
import { defineEventHandler, proxyRequest } from 'h3'

export default defineEventHandler(async (event) => {
	const config = useRuntimeConfig()
	const publicConfig = config.public as any

	// The real runtime config shape is directus.url (see layers/commerce's
	// nuxt.config.ts) — this previously read directus.rest.baseUrl, a field
	// that has never existed, so this route always threw the error below
	// regardless of configuration.
	if (!publicConfig.directus?.url) {
		throw new Error('Missing `runtimeConfig.apiURL` configuration.')
	}

	const target = joinURL(publicConfig.directus.url, event.path.replace(/^\/api\/proxy\//, ''))

	return proxyRequest(event, target, {
		cookieDomainRewrite: new URL(publicConfig.siteUrl).hostname,
		cookiePathRewrite: '/',
	})
})