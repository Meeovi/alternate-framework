import type { DirectusSchema, DirectusCollection, DirectusField } from '../schema/types';

export function getCollection(schema: DirectusSchema, name: string): DirectusCollection | undefined {
  return schema.collections.find(c => c.collection === name);
}

export function getCollectionFields(schema: DirectusSchema, name: string): DirectusField[] {
  return schema.fields.filter(f => f.collection === name);
}

export function listCollections(schema: DirectusSchema): string[] {
  return schema.collections.map(c => c.collection);
}

export function isSingleton(schema: DirectusSchema, name: string): boolean {
  const col = getCollection(schema, name);
  return col?.meta?.singleton === true;
}
