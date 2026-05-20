import { defineStore } from 'pinia';
import { getCommerceClient } from '../app/utils/client';
export const useWishlistStore = defineStore('wishlist', {
    state: () => ({
        items: [],
        isLoading: false,
        products: []
    }),
    actions: {
        addToWishlist(productId) {
            if (!this.items.includes(productId)) {
                this.items.push(productId);
            }
        },
        removeFromWishlist(productId) {
            this.items = this.items.filter((id) => id !== productId);
            this.products = this.products.filter((p) => p.id !== productId && p.sku !== productId);
        },
        async fetchWishlistProducts() {
            this.isLoading = true;
            try {
                const client = getCommerceClient();
                if (client && typeof client.getProducts === 'function') {
                    this.products = await client.getProducts({ ids: this.items });
                }
                else if (client && typeof client.getProductById === 'function') {
                    const loaded = [];
                    for (const id of this.items) {
                        try {
                            const p = await client.getProductById(id);
                            if (p)
                                loaded.push(p);
                        }
                        catch (e) { }
                    }
                    this.products = loaded;
                }
            }
            catch (e) {
                // ignore
            }
            finally {
                this.isLoading = false;
            }
        }
    }
});
