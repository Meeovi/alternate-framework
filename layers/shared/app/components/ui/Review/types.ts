import type { Product } from '../../types/ui'

export type ReviewProps = {
  review: Partial<Product> & { id?: string; rating?: number; comment?: string }
}
