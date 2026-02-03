import type { Review } from './review'

export interface ReviewState {
  reviews: Review[]
  isLoading: boolean
  error?: string | null
}
