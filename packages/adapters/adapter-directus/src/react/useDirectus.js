import { useContext } from 'react';
import { DirectusContext } from './DirectusProvider';
export function useReactDirectus() {
    const client = useContext(DirectusContext);
    if (!client) {
        throw new Error('Directus client not provided. Wrap your app in <DirectusProvider>.');
    }
    return client;
}
