import { createDirectus, rest, readItem, readItems, createItem, deleteItem, uploadFiles, readSingleton } from '@mframework/adapter-directus';
import "dotenv"
import type { DirectusSchema } from '@mframework/adapter-directus';

export default defineNuxtPlugin(() => {
	const config = useRuntimeConfig();
	// Type assertion to help TypeScript recognize the url property
	const directusConfig = config.public.directus as { url: string };
	const directus = createDirectus<DirectusSchema>(`${directusConfig.url}`).with(rest());
	return {
		provide: { directus, readItem, readItems, createItem, deleteItem, uploadFiles, readSingleton },
	};
});