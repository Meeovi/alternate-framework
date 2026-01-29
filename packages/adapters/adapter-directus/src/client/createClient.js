import { createDirectus, rest, authentication, readItem, readItems, createItem, updateItem, deleteItem, uploadFiles, readSingleton, readFieldsByCollection } from '@directus/sdk';
export function createMeeoviDirectusClient(url) {
    const client = createDirectus(url)
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
const directusUrl = import.meta?.env?.DIRECTUS_URL || 'http://localhost:8055';
export const directus = createMeeoviDirectusClient(directusUrl).client;
