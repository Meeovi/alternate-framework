import { createDirectus, rest, readItem, readItems, createItem, deleteItem, uploadFiles, readSingleton, readFields } from '@directus/sdk';

export default defineNuxtPlugin(() => {
	const config = useRuntimeConfig()

	const directusUrl = config.public.directus?.url || process.env.DIRECTUS_URL || ''
	if (!directusUrl) {
		console.warn('[Directus] No URL configured, using placeholder')
	}

	const directus = createDirectus(directusUrl).with(rest());

	return {
		provide: { directus, readItem, readItems, createItem, deleteItem, uploadFiles, readSingleton, readFieldsByCollection: readFields },
	};
});