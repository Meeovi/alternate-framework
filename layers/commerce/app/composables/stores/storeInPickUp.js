import { defineStore } from 'pinia';
export const useStoreInPickupStore = defineStore('storeInPickUp', {
    state: () => ({
        selectedStoreId: null,
        stores: []
    }),
    actions: {
        setSelectedStore(storeId) {
            this.selectedStoreId = storeId;
        },
        async fetchStores() {
            try {
                const response = await $fetch('/api/stores');
                this.stores = response;
            }
            catch (error) {
                console.error('Error fetching stores:', error);
            }
        }
    }
});
