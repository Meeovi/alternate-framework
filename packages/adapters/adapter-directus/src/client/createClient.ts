import {
  createDirectus,
  rest,
  authentication,
  readItem,
  readItems,
  createItem,
  updateItem,
  deleteItem,
  uploadFiles,
  readSingleton,
  readFieldsByCollection
} from '@directus/sdk';
import type { RestClient } from '@directus/sdk';

export interface MeeoviDirectusClient<Schema> {
  client: RestClient<Schema>;
  request: RestClient<Schema>['request'];
  readItem: typeof readItem;
  readItems: typeof readItems;
  createItem: typeof createItem;
  updateItem: typeof updateItem;
  deleteItem: typeof deleteItem;
  uploadFiles: typeof uploadFiles;
  readSingleton: typeof readSingleton;
  readFieldsByCollection: typeof readFieldsByCollection;
}

export function createMeeoviDirectusClient<Schema>(url: string): MeeoviDirectusClient<Schema> {
  const client = createDirectus<Schema>(url)
    .with(rest())
    .with(authentication());

  return {
    client,
    request: client.request,
    readItem,
    readItems,
    createItem,
    updateItem,
    deleteItem,
    uploadFiles,
    readSingleton,
    readFieldsByCollection
  };
}

const directusUrl = (import.meta as any)?.env?.DIRECTUS_URL || 'http://localhost:8055';

export const directus = createMeeoviDirectusClient<any>(directusUrl).client;