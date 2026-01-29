import { defineAlternateModule, useAlternateEventBus } from '@meeovi/core';
import { getListsConfig } from './config';
import { registerListsProviderRuntime } from './registry';
export default defineAlternateModule({
    id: 'lists',
    adapters: {},
    async setup(ctx) {
        const bus = useAlternateEventBus();
        const config = getListsConfig();
        // If a core adapter was registered under the `lists` key, register it
        // into the local provider registry so UI code can consume it via `useLists()`.
        // If a core adapter was registered under the `lists` key, adapt it
        // into the `ListsProvider` shape and register it into the local registry.
        try {
            const runtimeAdapter = ctx.getAdapter('lists');
            if (runtimeAdapter) {
                const provider = {
                    getList: (id) => runtimeAdapter.getList(id),
                    listLists: (params) => runtimeAdapter.listLists(params),
                    createList: (data) => runtimeAdapter.createList(data),
                    updateList: (id, data) => runtimeAdapter.updateList(id, data),
                    deleteList: (id) => runtimeAdapter.deleteList(id),
                    addItem: (listId, item) => runtimeAdapter.addItem(listId, item),
                    updateItem: (listId, itemId, data) => runtimeAdapter.updateItem(listId, itemId, data),
                    deleteItem: (listId, itemId) => runtimeAdapter.deleteItem(listId, itemId),
                    reorderItems: runtimeAdapter.reorderItems ? (listId, itemIds) => runtimeAdapter.reorderItems(listId, itemIds) : undefined
                };
                registerListsProviderRuntime('core', provider);
            }
        }
        catch (e) {
            // noop
        }
        // Listen for runtime adapter registrations from ModuleRegistry
        bus.on('adapter:registered', (payload) => {
            try {
                if (payload?.key === 'lists') {
                    const runtimeAdapter = ctx.getAdapter('lists');
                    if (runtimeAdapter) {
                        const provider = {
                            getList: (id) => runtimeAdapter.getList(id),
                            listLists: (params) => runtimeAdapter.listLists(params),
                            createList: (data) => runtimeAdapter.createList(data),
                            updateList: (id, data) => runtimeAdapter.updateList(id, data),
                            deleteList: (id) => runtimeAdapter.deleteList(id),
                            addItem: (listId, item) => runtimeAdapter.addItem(listId, item),
                            updateItem: (listId, itemId, data) => runtimeAdapter.updateItem(listId, itemId, data),
                            deleteItem: (listId, itemId) => runtimeAdapter.deleteItem(listId, itemId),
                            reorderItems: runtimeAdapter.reorderItems ? (listId, itemIds) => runtimeAdapter.reorderItems(listId, itemIds) : undefined
                        };
                        registerListsProviderRuntime('core', provider);
                    }
                }
            }
            catch (e) {
                /* noop */
            }
        });
    }
});
