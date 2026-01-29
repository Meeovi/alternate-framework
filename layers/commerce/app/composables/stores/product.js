import { defineStore } from 'pinia';
export const useProductStore = defineStore('product', {
    state: () => ({
        products: [],
        selectedProduct: null,
        isLoading: false
    }),
    actions: {
        async fetchProducts() {
            this.isLoading = true;
            try {
                const response = await $fetch('/api/products'); // Update API endpoint
                this.products = response;
            }
            catch (error) {
                console.error('Error fetching products:', error);
            }
            finally {
                this.isLoading = false;
            }
        },
        selectProduct(product) {
            this.selectedProduct = product;
        }
    }
});
