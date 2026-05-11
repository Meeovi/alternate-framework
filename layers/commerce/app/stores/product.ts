import { defineStore } from 'pinia';
import type { Product } from '../types/commerce.type';
// import { useProducts } from '../composables/catalog/products'


interface ProductState {
    products: Product[];
    selectedProduct: Product | null;
    isLoading: boolean;
}

export const useProductStore = defineStore('product', {
    state: (): ProductState => ({
        products: [],
        selectedProduct: null,
        isLoading: false
    }),
    actions: {
        async fetchProducts(options: any = {}) {
            this.isLoading = true;
            try {
                // const { getProducts } = useProducts()
                // const response = await getProducts(options)
                // ;(this as any).products = response as DomainProduct[]
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                this.isLoading = false;
            }
        },
        selectProduct(product: Product) {
            ;(this as any).selectedProduct = product
        }
    }
});
