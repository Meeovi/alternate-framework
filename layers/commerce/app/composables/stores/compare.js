// stores/compare.ts
import { defineStore } from 'pinia';
export const useCompareStore = defineStore('compare', {
    state: () => ({
        isLoading: false,
        count: 0,
        attributes: [],
        products: [],
        productSkus: [],
        items: []
    }),
    actions: {
        toggleLoader(isLoading) {
            this.isLoading = isLoading;
        },
        setCompareList(payload) {
            this.attributes = payload.attributes || [];
            this.products = payload.products || [];
            this.items = payload.items || [];
        },
        removeComparedProduct(productSku) {
            this.products = this.products.filter(product => product.sku !== productSku);
            this.productSkus = this.productSkus.filter(sku => sku !== productSku);
            this.items = this.items.filter(item => item.product.sku !== productSku);
        },
        clearComparedProducts() {
            this.products = [];
            this.productSkus = [];
            this.items = [];
            this.count = 0;
        },
        setCompareListSkus(productSkus) {
            this.productSkus = productSkus;
        },
        addComparedProductSku(productSku) {
            if (!this.productSkus.includes(productSku)) {
                this.productSkus.push(productSku);
            }
        },
        updateCompareTotals(compareTotals) {
            this.count = parseInt(compareTotals, 10); // Convert string to number
        }
    },
    getters: {
        getCompareCount: (state) => state.count,
        getComparedProducts: (state) => state.products,
        getComparedProductSkus: (state) => state.productSkus,
        getIsLoading: (state) => state.isLoading
    }
});
