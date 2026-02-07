import { defineStore } from 'pinia';
import { getCommerceClient } from '../utils/client'
import type { Product as DomainProduct } from '../types/domain'

type WishlistState = { items: string[]; isLoading: boolean; products: DomainProduct[] }

export const useWishlistStore = defineStore('wishlist', {
    state: (): WishlistState => ({
        items: [],
        isLoading: false,
        products: []
    }),
    actions: {
        addToWishlist(productId: string) {
            if (!this.items.includes(productId)) {
                this.items.push(productId);
            }
        },
        removeFromWishlist(productId: string) {
            this.items = this.items.filter((id: string) => id !== productId);
            this.products = this.products.filter((p: any) => p.id !== productId && p.sku !== productId);
        },
        async fetchWishlistProducts() {
            this.isLoading = true
            try {
                const client = getCommerceClient()
                if (client && typeof client.getProducts === 'function') {
                    this.products = await client.getProducts({ ids: this.items })
                } else if (client && typeof client.getProductById === 'function') {
                    const loaded: DomainProduct[] = []
                    for (const id of this.items) {
                        try {
                            const p = await client.getProductById(id)
                            if (p) loaded.push(p)
                        } catch (e) {}
                    }
                    this.products = loaded
                }
            } catch (e) {
                // ignore
            } finally {
                this.isLoading = false
            }
        }
    }
});
