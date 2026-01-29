import { getSellerProvider } from './registry';
import { getCurrentSellerId } from './_auth';
export function useSellerReviews() {
    const provider = getSellerProvider();
    async function listReviews(params) {
        const sellerId = getCurrentSellerId();
        return provider.listReviews?.(params, { sellerId }) ?? [];
    }
    async function moderateReview(id, action) {
        const sellerId = getCurrentSellerId();
        return provider.moderateReview?.(id, action, { sellerId });
    }
    return { listReviews, moderateReview };
}
