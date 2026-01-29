import { inject } from 'vue';
import { DirectusKey } from './DirectusProvider';
export function useVueDirectus() {
    const client = inject(DirectusKey);
    if (!client) {
        throw new Error('Directus client not provided. Wrap your app in <DirectusProvider>.');
    }
    return client;
}
