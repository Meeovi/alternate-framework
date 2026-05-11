import { defineStore } from 'pinia';
import { getCommerceClient } from '../utils/client'
import type { Review } from '../types/commerce.type'

type ReviewState = { reviews: Review[]; isLoading: boolean }

export const useReviewStore = defineStore('review', {
    state: (): ReviewState => ({
        reviews: [],
        isLoading: false
    }),
    actions: {
        async fetchReviews(productId: string) {
            this.isLoading = true;
            try {
                const client = getCommerceClient()
                if (client && typeof client.listReviews === 'function') {
                    this.reviews = await client.listReviews({ productId }) as Review[]
                } else {
                    const response = await $fetch<Review[]>(`/api/reviews?productId=${productId}`);
                    this.reviews = (response || []) as Review[]
                }
            } catch (error) {
                console.error('Error fetching reviews:', error);
            } finally {
                this.isLoading = false;
            }
        },
        addReview(review: Review) {
            this.reviews.push(review);
        }
    }
});
