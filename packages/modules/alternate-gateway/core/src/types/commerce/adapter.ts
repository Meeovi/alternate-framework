import type {
    CommerceCart
} from "./cart";
import type {
    CommerceCategory
} from "./category";
import type {
    CommerceProduct
} from "./product";

export interface CommerceAdapter {
  getProductBySlug(slug: string): Promise<CommerceProduct | null>
  getProducts(params: {
    search?: string
    categoryId?: string
    limit?: number
    offset?: number
  }): Promise<CommerceProduct[]>

  getCategoryTree(): Promise<CommerceCategory[]>

  getCart(cartId: string): Promise<CommerceCart | null>
  addToCart(
    cartId: string | null,
    input: { productId: string; quantity: number }
  ): Promise<CommerceCart>
}