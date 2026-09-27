import { createDirectus, rest, readItem, readItems, createItem, uploadFiles } from '@directus/sdk';

export default defineNuxtPlugin(() => {
	const config = useRuntimeConfig()
	const url = config.public.directus?.url

	// Fail with an actionable message instead of the SDK's bare "Invalid URL"
	// (the value is baked in at build time from DIRECTUS_URL).
	try {
		new URL(String(url))
	} catch {
		throw createError({
			statusCode: 500,
			statusMessage: `DIRECTUS_URL is missing or not a valid URL (got ${JSON.stringify(url)}). Set it to e.g. https://novels.meeovicms.com and rebuild.`,
			fatal: true,
		})
	}

	const directus = createDirectus(String(url)).with(rest());
	return {
		provide: { directus, readItem, readItems, createItem, uploadFiles },
	};
});
