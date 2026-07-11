import { defineStore } from '#imports'
import { getCommerceClient } from '../utils/client'
import type { Product } from '../types/commerce'

type WishlistState = { items: string[]; isLoading: boolean; products: Product[] }

export const useWishlistStore = defineStore('wishlist', {
    state: (): WishlistState => ({
        items: [],
        isLoading: false,
        products: []
    }),
    actions: {
        addToWishlist(productId: string) {
            const state = this as unknown as WishlistState
            if (!state.items.includes(productId)) {
                state.items.push(productId);
            }
        },
        removeFromWishlist(productId: string) {
            const state = this as unknown as WishlistState
            state.items = state.items.filter((id: string) => id !== productId);
            state.products = state.products.filter((p: any) => p.id !== productId && p.sku !== productId);
        },
        async fetchWishlistProducts() {
            const state = this as unknown as WishlistState
            state.isLoading = true
            try {
                const client = getCommerceClient()
                if (client && typeof client.getProducts === 'function') {
                    state.products = await client.getProducts({ ids: state.items })
                } else if (client && typeof client.getProductById === 'function') {
                    const loaded: Product[] = []
                    for (const id of state.items) {
                        try {
                            const p = await client.getProductById(id)
                            if (p) loaded.push(p)
                        } catch (e) {}
                    }
                    state.products = loaded
                }
            } catch (e) {
                // ignore
            } finally {
                state.isLoading = false
            }
        }
    }
});
