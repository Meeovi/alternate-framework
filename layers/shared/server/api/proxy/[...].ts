import { joinURL } from 'ufo'
import { defineEventHandler, proxyRequest } from 'h3'
import { requireAuth } from '#auth/server/utils/sessions'

export default defineEventHandler(async (event) => {
	// This forwards arbitrary requests to the Directus instance through the app's
	// own domain (with cookie-domain rewriting), which would otherwise let any
	// anonymous caller use the site as an open reverse proxy to the whole
	// Directus API surface. Gate it behind an authenticated app session.
	await requireAuth(event)

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