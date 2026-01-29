import { getListsConfig } from './config';
import { getListsProvider } from './registry';
export function useLists() {
    const { provider } = getListsConfig();
    const lists = getListsProvider(provider);
    return {
        getList: lists.getList,
        listLists: lists.listLists,
        createList: lists.createList,
        updateList: lists.updateList,
        deleteList: lists.deleteList,
        addItem: lists.addItem,
        updateItem: lists.updateItem,
        deleteItem: lists.deleteItem,
        reorderItems: lists.reorderItems
    };
}
