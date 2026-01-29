// schema/introspect.ts
import { readFieldsByCollection, readItems } from '@directus/sdk';
export async function introspectCollections(client) {
    return await client.request(readItems('directus_collection'));
}
export async function introspectFields(client, collection) {
    return await client.request(readFieldsByCollection(collection));
}
export async function introspectRelations(client) {
    return await client.request(readItems('directus_relations'));
}
export async function introspectSchema(client) {
    const [collections, relations] = await Promise.all([
        introspectCollections(client),
        introspectRelations(client),
    ]);
    const fields = [];
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
