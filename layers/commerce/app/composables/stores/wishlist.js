import { defineStore } from 'pinia';
export const useWishlistStore = defineStore('wishlist', {
    state: () => ({
        items: [],
        isLoading: false
    }),
    actions: {
        addToWishlist(productId) {
            if (!this.items.includes(productId)) {
                this.items.push(productId);
            }
        },
        removeFromWishlist(productId) {
            this.items = this.items.filter(id => id !== productId);
        }
    }
});
