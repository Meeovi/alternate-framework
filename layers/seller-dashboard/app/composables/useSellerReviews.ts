import { getSellerProvider } from './registry'
import { getCurrentSellerId } from './_auth'

export function useSellerReviews() {
  const provider = getSellerProvider()

  async function listReviews(params?: any) {
    const sellerId = getCurrentSellerId()
    return provider.listReviews?.(params, { sellerId }) ?? []
  }

  async function moderateReview(id: string, action: 'approve' | 'reject' | 'hide') {
    const sellerId = getCurrentSellerId()
    return provider.moderateReview?.(id, action, { sellerId })
  }

  return { listReviews, moderateReview }
}
