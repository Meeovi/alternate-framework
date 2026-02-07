import { defineStore } from 'pinia';
import { getCommerceClient } from '../utils/client'
import type { Review as DomainReview } from '../types/domain'

type ReviewState = { reviews: DomainReview[]; isLoading: boolean }

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
                    this.reviews = await client.listReviews({ productId }) as DomainReview[]
                } else {
                    const response = await $fetch<DomainReview[]>(`/api/reviews?productId=${productId}`);
                    this.reviews = (response || []) as DomainReview[]
                }
            } catch (error) {
                console.error('Error fetching reviews:', error);
            } finally {
                this.isLoading = false;
            }
        },
        addReview(review: DomainReview) {
            this.reviews.push(review);
        }
    }
});
