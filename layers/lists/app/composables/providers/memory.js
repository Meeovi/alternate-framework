import { registerListsProvider } from '../registry';
import { nanoid } from 'nanoid';
const lists = new Map();
const MemoryListsProvider = {
    async getList(id) {
        const list = lists.get(id);
        if (!list)
            throw new Error(`List ${id} not found`);
        return list;
    },
    async listLists() {
        return Array.from(lists.values());
    },
    async createList(data) {
        const id = nanoid();
        const list = {
            id,
            title: data.title || 'Untitled List',
            type: data.type || 'list',
            items: [],
            metadata: data.metadata || {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        lists.set(id, list);
        return list;
    },
    async updateList(id, data) {
        const list = await this.getList(id);
        const updated = {
            ...list,
            ...data,
            updatedAt: new Date().toISOString()
        };
        lists.set(id, updated);
        return updated;
    },
    async deleteList(id) {
        lists.delete(id);
    },
    async addItem(listId, item) {
        const list = await this.getList(listId);
        const newItem = {
            id: nanoid(),
            title: item.title || '',
            description: item.description,
            completed: item.completed || false,
            position: list.items.length,
            parentId: item.parentId,
            metadata: item.metadata || {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        list.items.push(newItem);
        return newItem;
    },
    async updateItem(listId, itemId, data) {
        const list = await this.getList(listId);
        const item = list.items.find(i => i.id === itemId);
        if (!item)
            throw new Error(`Item ${itemId} not found`);
        Object.assign(item, data, { updatedAt: new Date().toISOString() });
        return item;
    },
    async deleteItem(listId, itemId) {
        const list = await this.getList(listId);
        list.items = list.items.filter(i => i.id !== itemId);
    },
    async reorderItems(listId, itemIds) {
        const list = await this.getList(listId);
        const newOrder = itemIds.map(id => list.items.find(i => i.id === id));
        list.items = newOrder.map((item, index) => ({
            ...item,
            position: index
        }));
    },
    async toggleComplete(listId, itemId, completed = true) {
        const item = await this.updateItem(listId, itemId, { completed });
        return item;
    },
    async setDueDate(listId, itemId, dueDate) {
        const item = await this.updateItem(listId, itemId, { metadata: { ...((await this.getList(listId)).items.find(i => i.id === itemId)?.metadata || {}), dueDate } });
        return item;
    },
    async setReminder(listId, itemId, reminder) {
        const item = await this.updateItem(listId, itemId, { metadata: { ...((await this.getList(listId)).items.find(i => i.id === itemId)?.metadata || {}), reminder } });
        return item;
    },
    async setPriority(listId, itemId, priority) {
        const item = await this.updateItem(listId, itemId, { metadata: { ...((await this.getList(listId)).items.find(i => i.id === itemId)?.metadata || {}), priority } });
        return item;
    },
    async shareList(listId, userId, role = 'editor') {
        // memory store: attach collaborators in list.metadata.collaborators
        const list = await this.getList(listId);
        const collaborators = list.metadata?.collaborators || [];
        collaborators.push({ userId, role });
        list.metadata = { ...(list.metadata || {}), collaborators };
    },
    async searchItems(listId, query) {
        const list = await this.getList(listId);
        const q = String(query).toLowerCase();
        return list.items.filter(i => (i.title || '').toLowerCase().includes(q) || (i.description || '').toLowerCase().includes(q));
    },
    async archiveList(listId) {
        const list = await this.getList(listId);
        list.metadata = { ...(list.metadata || {}), archived: true };
    }
};
registerListsProvider('memory', MemoryListsProvider);
