import { registerListsProvider } from '../registry';
import { getListsConfig } from '../config';
async function directusFetch(path, options = {}) {
    const cfg = getListsConfig();
    const base = cfg.baseUrl?.replace(/\/$/, '') || '';
    const res = await fetch(`${base}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(cfg.apiKey ? { Authorization: `Bearer ${cfg.apiKey}` } : {}),
            ...(options.headers || {})
        }
    });
    if (!res.ok) {
        const err = new Error(`Directus error: ${res.status}`);
        err.status = res.status;
        err.response = res;
        throw err;
    }
    return res.json();
}
const DirectusListsProvider = {
    async getList(id) {
        const json = await directusFetch(`/lists/${id}`);
        return json.list ?? json;
    },
    async listLists() {
        const json = await directusFetch(`/lists`);
        return json.lists ?? json;
    },
    async createList(data) {
        const json = await directusFetch(`/lists`, { method: 'POST', body: JSON.stringify(data) });
        return json.list ?? json;
    },
    async updateList(id, data) {
        const json = await directusFetch(`/lists/${id}`, { method: 'PUT', body: JSON.stringify(data) });
        return json.list ?? json;
    },
    async deleteList(id) {
        await directusFetch(`/lists/${id}`, { method: 'DELETE' });
    },
    async addItem(listId, item) {
        const json = await directusFetch(`/lists/${listId}/items`, { method: 'POST', body: JSON.stringify(item) });
        return json.item ?? json;
    },
    async updateItem(listId, itemId, data) {
        const json = await directusFetch(`/lists/${listId}/items/${itemId}`, { method: 'PUT', body: JSON.stringify(data) });
        return json.item ?? json;
    },
    async deleteItem(listId, itemId) {
        await directusFetch(`/lists/${listId}/items/${itemId}`, { method: 'DELETE' });
    },
    async reorderItems(listId, itemIds) {
        await directusFetch(`/lists/${listId}/reorder`, { method: 'POST', body: JSON.stringify({ items: itemIds }) });
    },
    async toggleComplete(listId, itemId, completed = true) {
        try {
            const json = await directusFetch(`/lists/${listId}/items/${itemId}/toggle`, { method: 'POST', body: JSON.stringify({ completed }) });
            return json.item ?? json;
        }
        catch (e) {
            const json = await directusFetch(`/lists/${listId}/items/${itemId}`, { method: 'PUT', body: JSON.stringify({ completed }) });
            return json.item ?? json;
        }
    },
    async setDueDate(listId, itemId, dueDate) {
        try {
            const json = await directusFetch(`/lists/${listId}/items/${itemId}/due`, { method: 'POST', body: JSON.stringify({ dueDate }) });
            return json.item ?? json;
        }
        catch (e) {
            const json = await directusFetch(`/lists/${listId}/items/${itemId}`, { method: 'PUT', body: JSON.stringify({ metadata: { dueDate } }) });
            return json.item ?? json;
        }
    },
    async setReminder(listId, itemId, reminder) {
        try {
            const json = await directusFetch(`/lists/${listId}/items/${itemId}/reminder`, { method: 'POST', body: JSON.stringify({ reminder }) });
            return json.item ?? json;
        }
        catch (e) {
            const json = await directusFetch(`/lists/${listId}/items/${itemId}`, { method: 'PUT', body: JSON.stringify({ metadata: { reminder } }) });
            return json.item ?? json;
        }
    },
    async setPriority(listId, itemId, priority) {
        try {
            const json = await directusFetch(`/lists/${listId}/items/${itemId}/priority`, { method: 'POST', body: JSON.stringify({ priority }) });
            return json.item ?? json;
        }
        catch (e) {
            const json = await directusFetch(`/lists/${listId}/items/${itemId}`, { method: 'PUT', body: JSON.stringify({ metadata: { priority } }) });
            return json.item ?? json;
        }
    },
    async shareList(listId, userId, role = 'editor') {
        try {
            await directusFetch(`/lists/${listId}/share`, { method: 'POST', body: JSON.stringify({ userId, role }) });
        }
        catch (e) {
            const json = await directusFetch(`/lists/${listId}`);
            const list = json.list ?? json;
            const collaborators = (list.metadata?.collaborators || []).concat({ userId, role });
            await directusFetch(`/lists/${listId}`, { method: 'PUT', body: JSON.stringify({ metadata: { ...(list.metadata || {}), collaborators } }) });
        }
    },
    async searchItems(listId, query) {
        try {
            const json = await directusFetch(`/lists/${listId}/search?q=${encodeURIComponent(String(query))}`);
            return json.items ?? json;
        }
        catch (e) {
            const json = await directusFetch(`/lists/${listId}`);
            const list = json.list ?? json;
            const q = String(query).toLowerCase();
            return list.items.filter((i) => (i.title || '').toLowerCase().includes(q) || (i.description || '').toLowerCase().includes(q));
        }
    },
    async archiveList(listId) {
        try {
            await directusFetch(`/lists/${listId}/archive`, { method: 'POST' });
        }
        catch (e) {
            const json = await directusFetch(`/lists/${listId}`);
            const list = json.list ?? json;
            await directusFetch(`/lists/${listId}`, { method: 'PUT', body: JSON.stringify({ metadata: { ...(list.metadata || {}), archived: true } }) });
        }
    }
};
registerListsProvider('directus', DirectusListsProvider);
