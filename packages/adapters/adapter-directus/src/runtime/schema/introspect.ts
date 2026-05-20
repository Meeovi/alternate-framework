// schema/introspect.ts

import {
  readFieldsByCollection,
  readItems
} from '@directus/sdk';
import type {
  DirectusSchema,
  DirectusField,
  DirectusCollection,
  DirectusRelation,
} from './types';

export async function introspectCollections(client: any): Promise<DirectusCollection[]> {
  return await client.request((readItems as any)('directus_collection'));
}

export async function introspectFields(client: any, collection: string): Promise<DirectusField[]> {
  return await client.request((readFieldsByCollection as any)(collection));
}

export async function introspectRelations(client: any): Promise<DirectusRelation[]> {
  return await client.request((readItems as any)('directus_relations'));
}

export async function introspectSchema(client: any): Promise<DirectusSchema> {
  const [collections, relations] = await Promise.all([
    introspectCollections(client),
    introspectRelations(client),
  ]);

  const fields: DirectusField[] = [];

  for (const col of collections) {
    const colFields = await introspectFields(client, col.collection);
    fields.push(...colFields);
  }

  return {
    collections,
    fields,
    relations,
    directus_collections: collections,
    directus_fields: fields,
    directus_relations: relations,
  };
}
