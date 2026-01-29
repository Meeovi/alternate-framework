import { registerListsProvider } from '../registry';
import { wrapSocialRequest } from '@meeovi/social';
import { transformList, transformItem } from '../utils/transforms';
import { validateListInput, validateItemInput } from '../utils/validation';
import { getListsConfig } from '../config';
async function atprotoFetch(path, options = {}) {
    const { baseUrl, apiKey } = getListsConfig();
    const res = await fetch(`${baseUrl}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
            ...(options.headers || {})
        }
    });
    if (!res.ok) {
        const error = new Error(`ATProto error: ${res.status}`);
        error.status = res.status;
        error.response = res;
        throw error;
    }
    return res.json();
}
const AtprotoListsProvider = {
    async getList(id) {
        return wrapSocialRequest('atproto', async () => {
            const data = await atprotoFetch(`/xrpc/app.bsky.graph.getList?list=${id}`);
            return transformList(data.list);
        }, {
            cacheKey: `atproto:list:${id}`,
            ttlMs: 1000 * 30,
            retry: true,
            swr: true
        });
    },
    async listLists() {
        return wrapSocialRequest('atproto', async () => {
            const data = await atprotoFetch(`/xrpc/app.bsky.graph.getLists`);
            return data.lists.map(transformList);
        }, {
            cacheKey: `atproto:lists`,
            ttlMs: 1000 * 30,
            retry: true,
            swr: true
        });
    },
    async createList(data) {
        validateListInput(data);
        return wrapSocialRequest('atproto', async () => {
            const result = await atprotoFetch(`/xrpc/app.bsky.graph.createList`, {
                method: 'POST',
                body: JSON.stringify({
                    name: data.title,
                    purpose: data.type ?? 'list',
                    description: data.metadata?.description ?? ''
                })
            });
            return transformList(result);
        });
    },
    async updateList(id, data) {
        validateListInput(data);
        return wrapSocialRequest('atproto', async () => {
            const result = await atprotoFetch(`/xrpc/app.bsky.graph.updateList`, {
                method: 'POST',
                body: JSON.stringify({
                    list: id,
                    name: data.title,
                    description: data.metadata?.description
                })
            });
            return transformList(result);
        });
    },
    async deleteList(id) {
        return wrapSocialRequest('atproto', async () => {
            await atprotoFetch(`/xrpc/app.bsky.graph.deleteList`, {
                method: 'POST',
                body: JSON.stringify({ list: id })
            });
        });
    },
    async addItem(listId, item) {
        validateItemInput(item);
        return wrapSocialRequest('atproto', async () => {
            const result = await atprotoFetch(`/xrpc/app.bsky.graph.addListItem`, {
                method: 'POST',
                body: JSON.stringify({
                    list: listId,
                    subject: item.title // ATProto uses "subject" for list entries
                })
            });
            return transformItem(result);
        });
    },
    async updateItem(listId, itemId, data) {
        validateItemInput(data);
        return wrapSocialRequest('atproto', async () => {
            const result = await atprotoFetch(`/xrpc/app.bsky.graph.updateListItem`, {
                method: 'POST',
                body: JSON.stringify({
                    list: listId,
                    item: itemId,
                    ...data
                })
            });
            return transformItem(result);
        });
    },
    async deleteItem(listId, itemId) {
        return wrapSocialRequest('atproto', async () => {
            await atprotoFetch(`/xrpc/app.bsky.graph.deleteListItem`, {
                method: 'POST',
                body: JSON.stringify({
                    list: listId,
                    item: itemId
                })
            });
        });
    },
    async reorderItems(listId, itemIds) {
        return wrapSocialRequest('atproto', async () => {
            await atprotoFetch(`/xrpc/app.bsky.graph.reorderListItems`, {
                method: 'POST',
                body: JSON.stringify({
                    list: listId,
                    items: itemIds
                })
            });
        });
    }
};
registerListsProvider('atproto', AtprotoListsProvider);
