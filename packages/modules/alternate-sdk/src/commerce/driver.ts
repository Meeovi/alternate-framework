import type { CommerceDriverContract, Product, Category, Brand, Price, PriceRule, Cart, Checkout, ProductFilter } from '../contracts/commerce.js'
import { executeMesh } from '@mframework/adapter-gateway/client'
import * as ProductQueries from './operations/product.queries.js'
import * as CartQueries from './operations/cart.queries.js'
import * as CheckoutQueries from './operations/checkout.queries.js'

class CommerceMeshDriver implements CommerceDriverContract {
  products = {
    getProduct: async (id: string): Promise<Product | null> => {
      const result = await executeMesh(ProductQueries.GetProductQuery, { id })
      return result?.product ?? null
    },

    getProducts: async (filter?: ProductFilter): Promise<Product[]> => {
      const result = await executeMesh(ProductQueries.GetProductsQuery, { filter })
      return result?.products ?? []
    },

    getCategories: async (): Promise<Category[]> => {
      const result = await executeMesh(ProductQueries.GetCategoriesQuery)
      return result?.categories ?? []
    },

    getCategory: async (id: string): Promise<Category | null> => {
      const result = await executeMesh(ProductQueries.GetCategoryQuery, { id })
      return result?.category ?? null
    },

    getBrands: async (): Promise<Brand[]> => {
      const result = await executeMesh(ProductQueries.GetBrandsQuery)
      return result?.brands ?? []
    },

    getBrand: async (id: string): Promise<Brand | null> => {
      const result = await executeMesh(ProductQueries.GetBrandQuery, { id })
      return result?.brand ?? null
    },

    search: async (query: string, opts?: { limit?: number; offset?: number }): Promise<Product[]> => {
      const result = await executeMesh(ProductQueries.SearchProductsQuery, { query, limit: opts?.limit, offset: opts?.offset })
      return result?.search ?? []
    },

    getPrice: async (productId: string): Promise<Price | null> => {
      const result = await executeMesh(ProductQueries.GetPriceQuery, { productId })
      return result?.price ?? null
    },

    getCatalogPriceRules: async (): Promise<PriceRule[]> => {
      const result = await executeMesh(ProductQueries.GetCatalogPriceRulesQuery)
      return result?.priceRules ?? []
    }
  }

  cart = {
    getCart: async (cartId?: string): Promise<Cart | null> => {
      const result = await executeMesh(CartQueries.GetCartQuery, { cartId })
      return result?.cart ?? null
    },

    addToCart: async (input: { productId: string; quantity: number; cartId?: string }): Promise<Cart | null> => {
      const result = await executeMesh(CartQueries.AddToCartMutation, { input })
      if (!result?.addToCart) {
        throw new Error('MFramework Driver Exception: Failed to add item to cart downstream.')
      }
      return result.addToCart
    },

    updateCart: async (input: { cartId: string; itemId: string; quantity: number }): Promise<Cart | null> => {
      const result = await executeMesh(CartQueries.UpdateCartMutation, { input })
      if (!result?.updateCart) {
        throw new Error('MFramework Driver Exception: Failed to update cart downstream.')
      }
      return result.updateCart
    },

    removeFromCart: async (itemId: string): Promise<Cart | null> => {
      const result = await executeMesh(CartQueries.RemoveFromCartMutation, { itemId })
      return result?.removeFromCart ?? null
    },

    clearCart: async (cartId: string): Promise<{ success: boolean }> => {
      const result = await executeMesh(CartQueries.ClearCartMutation, { cartId })
      return result?.clearCart ?? { success: false }
    }
  }

  checkout = {
    getCheckout: async (checkoutId: string): Promise<Checkout | null> => {
      const result = await executeMesh(CheckoutQueries.GetCheckoutQuery, { checkoutId })
      return result?.checkout ?? null
    },

    createCheckout: async (input: { cartId: string; email: string; shippingAddress?: Record<string, string>; billingAddress?: Record<string, string> }): Promise<Checkout | null> => {
      const result = await executeMesh(CheckoutQueries.CreateCheckoutMutation, { input })
      if (!result?.createCheckout) {
        throw new Error('MFramework Driver Exception: Failed to create checkout downstream.')
      }
      return result.createCheckout
    },

    updateCheckout: async (input: Record<string, unknown>): Promise<Checkout | null> => {
      const result = await executeMesh(CheckoutQueries.UpdateCheckoutMutation, { checkoutId: input.checkoutId as string, input })
      return result?.updateCheckout ?? null
    },

    completeCheckout: async (checkoutId: string): Promise<{ success: boolean }> => {
      const result = await executeMesh(CheckoutQueries.CompleteCheckoutMutation, { checkoutId })
      return result?.completeCheckout ?? { success: false }
    }
  }

  async getCartRules(opts?: { cartId?: string }): Promise<PriceRule[]> {
    const result = await executeMesh(CartQueries.GetCartPriceRulesQuery, { cartId: opts?.cartId })
    return result?.cartPriceRules ?? []
  }

  async getSuggestions(query: string, opts?: { limit?: number }): Promise<Product[]> {
    const result = await executeMesh(ProductQueries.GetSuggestionsQuery, { query, limit: opts?.limit })
    return result?.suggestions ?? []
  }
}

export default CommerceMeshDriver