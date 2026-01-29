import { defineStore } from 'pinia';
export const useReviewStore = defineStore('review', {
    state: () => ({
        reviews: [],
        isLoading: false
    }),
    actions: {
        async fetchReviews(productId) {
            this.isLoading = true;
            try {
                const response = await $fetch(`/api/reviews?productId=${productId}`);
                this.reviews = response;
            }
            catch (error) {
                console.error('Error fetching reviews:', error);
            }
            finally {
                this.isLoading = false;
            }
        },
        addReview(review) {
            this.reviews.push(review);
        }
    }
});
