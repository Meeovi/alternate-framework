import { defineNuxtPlugin, useRuntimeConfig } from '#app';
import { createDirectus, rest, readItem, readItems, createItem, deleteItem, uploadFiles, readSingleton, readCollection, updateCollection, readFields, readFieldsByCollection, realtime, authentication } from '@directus/sdk';
import "dotenv"

export default defineNuxtPlugin(() => {
	const config = useRuntimeConfig()

	const directus = createDirectus(`${config.directus.url}`).with(rest());	
	return {
		provide: { directus, readItem, readItems, createItem, deleteItem, uploadFiles, readSingleton, readCollection, updateCollection, readFields, readFieldsByCollection, realtime },
	};
});