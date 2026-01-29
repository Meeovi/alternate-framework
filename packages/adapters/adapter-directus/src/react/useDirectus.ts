import { useContext } from 'react';
import { DirectusContext } from './DirectusProvider';
import type { MeeoviDirectusClient } from '../client/createClient';

export function useReactDirectus<Schema>() {
  const client = useContext(DirectusContext) as MeeoviDirectusClient<Schema> | null;

  if (!client) {
    throw new Error('Directus client not provided. Wrap your app in <DirectusProvider>.');
  }

  return client;
}
