import { inject } from 'vue';
import { DirectusKey } from './DirectusProvider';
import type { MeeoviDirectusClient } from '../client/createClient';

export function useVueDirectus<Schema>() {
  const client = inject<MeeoviDirectusClient<Schema>>(DirectusKey);

  if (!client) {
    throw new Error('Directus client not provided. Wrap your app in <DirectusProvider>.');
  }

  return client;
}
