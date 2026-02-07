import { defineStore } from 'pinia';

export const useStoreInPickupStore = defineStore('storeInPickUp', {
    state: (): { selectedStoreId: string | null; stores: any[] } => ({
        selectedStoreId: null,
        stores: []
    }),
    actions: {
        setSelectedStore(storeId: string) {
            this.selectedStoreId = storeId;
        },
        async fetchStores() {
            try {
                const response = await $fetch<any[]>('/api/stores');
                this.stores = response as any[];
            } catch (error) {
                console.error('Error fetching stores:', error);
            }
        }
    }
});
