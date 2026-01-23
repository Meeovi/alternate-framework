import {
  defineNuxtPlugin,
  useRuntimeConfig
} from 'nuxt/app';
import {
  createMeeoviDirectusClient,
  DirectusVueProvider
} from '@meeovi/directus-client';

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();

  const directus = createMeeoviDirectusClient(config?.public?.directus?.url);

  nuxtApp.provide('directus', directus);

  // Register provider globally
  nuxtApp.vueApp.component('DirectusVueProvider', DirectusVueProvider);
});
