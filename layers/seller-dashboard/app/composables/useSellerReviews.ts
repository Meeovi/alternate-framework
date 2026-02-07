import { getSellerProvider } from './registry'
import mockProvider from './mockProvider'

export default function useSellerReviews() {
  const provider: any = getSellerProvider() || mockProvider

  async function listReviewsForSeller(sellerId: string, params?: Record<string, any>) {
    if (provider && typeof provider.listReviewsForSeller === 'function') return provider.listReviewsForSeller(sellerId, params)
    // Return all reviews that reference products owned by seller (mock behavior)
    const all = await provider.listReviews(undefined, params)
    return (all || []).filter((r: any) => r.sellerId === sellerId)
  }

  async function moderateReviewForSeller(reviewId: string, action: 'approve' | 'reject' | 'delete') {
    if (provider && typeof provider.moderateReview === 'function') return provider.moderateReview(reviewId, action)
    return mockProvider.moderateReview(reviewId, action)
  }

  return { listReviewsForSeller, moderateReviewForSeller }
}

export { useSellerReviews }
