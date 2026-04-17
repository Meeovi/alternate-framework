// stores/cartStore.ts
import { defineStore } from 'pinia'
import { getCommerceClient } from '../utils/client'
import { useAuth } from '../composables/globals/useAuth'
import { useInventory } from '../composables/catalog/useInventory'
import { useTax } from '../composables/sales/useTax'
import { useLoading } from '../composables/content/useLoading'
import { useNotification } from '../composables/globals/useNotification'
import { useCache } from '../composables/system/useCache'

class CartError extends Error {
  code: string
  constructor(message: string, code: string) {
    super(message)
    this.code = code
    this.name = 'CartError'
  }
}

interface CartProduct {
  sku: string
  name?: string
  price?: number
  qty: number
  quote_id?: string
  item_id?: string
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    isGuest: true,
    items: [] as CartProduct[],
    total: 0,
    quoteId: null as string | null,
    client: getCommerceClient()
  }),

  actions: {
    async initializeCart() {
      const auth = useAuth()
      this.isGuest = !auth.token.value
      try {
        if (this.isGuest) await this.createGuestCart()
        else await this.createCustomerCart()
      } catch (err) {
        console.error(err)
      }
    },

    async createGuestCart() {
      try {
        if (this.client && typeof this.client.createGuestCart === 'function') {
          this.quoteId = await this.client.createGuestCart()
          return
        }
        const response = await fetch(`${process.env.COMMERCE_API_URL}/guest-carts`, { method: 'POST' })
        this.quoteId = (await response.json()) as string
      } catch (err) {
        console.error(err)
      }
    },

    async createCustomerCart() {
      try {
        const auth = useAuth()
        if (this.client && typeof this.client.createCustomerCart === 'function') {
          this.quoteId = await this.client.createCustomerCart(auth.token?.value)
          return
        }
        const response = await fetch(`${process.env.COMMERCE_API_URL}/carts/mine`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${auth.token.value}` }
        })
        this.quoteId = await response.json()
      } catch (err) {
        console.error(err)
      }
    },

    async addItem(product: CartProduct) {
      const loading = useLoading()
      loading.startLoading('Adding to cart...')
      try {
        const auth = useAuth()
        if (auth.isTokenExpired()) await auth.refreshAccessToken()
        const inventory = useInventory()
        await inventory.checkInventory(product.sku, product.qty)
        if (!this.quoteId) await this.initializeCart()
        if (!this.quoteId) throw new CartError('Failed to create cart', 'CART_ERROR')

        if (this.client && typeof this.client.addItem === 'function') {
          const cartItem = await this.client.addItem(this.quoteId, product, auth.token?.value)
          const existing = this.items.find(i => i.sku === product.sku)
          if (existing) existing.qty += product.qty
          else this.items.push({ ...product, item_id: cartItem?.item_id })
        } else {
          const response = await fetch(`${process.env.COMMERCE_API_URL}/carts/mine/items`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${auth.token.value}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ cartItem: { sku: product.sku, qty: product.qty, quote_id: this.quoteId } })
          })
          if (!response.ok) throw new CartError('Failed to add item to cart', 'CART_ERROR')
          const cartItem = await response.json()
          const existing = this.items.find(i => i.sku === product.sku)
          if (existing) existing.qty += product.qty
          else this.items.push({ ...product, item_id: cartItem.item_id })
        }

        const tax = useTax()
        if (this.quoteId) await tax.calculateTax(this.quoteId)
        const cache = useCache()
        cache.setCacheItem(`cart_product_${product.sku}`, product)
        await this.calculateTotal()
        loading.stopLoading()
        useNotification().show({ type: 'success', message: 'Product added to cart' })
      } catch (err) {
        loading.stopLoading()
        console.error(err)
      }
    },

    async removeItem(itemId: string) {
      const loading = useLoading()
      loading.startLoading('Removing item...')
      try {
        const auth = useAuth()
        if (auth.isTokenExpired()) await auth.refreshAccessToken()

        if (this.client && typeof this.client.removeItem === 'function') {
          await this.client.removeItem(this.quoteId, itemId, auth.token?.value)
          this.items = this.items.filter(i => i.item_id !== itemId)
          await this.calculateTotal()
        } else {
          const response = await fetch(`${process.env.COMMERCE_API_URL}/carts/mine/items/${itemId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${auth.token.value}` } })
          if (!response.ok) throw new CartError('Failed to remove item from cart', 'CART_ERROR')
          this.items = this.items.filter(i => i.item_id !== itemId)
          await this.calculateTotal()
        }

        loading.stopLoading()
        useNotification().show({ type: 'success', message: 'Item removed from cart' })
      } catch (err) {
        loading.stopLoading()
        console.error(err)
      }
    },

    async calculateTotal() {
      try {
        const auth = useAuth()
        if (!this.quoteId) return
        if (this.client && typeof this.client.getTotals === 'function') {
          const totals = await this.client.getTotals(this.quoteId, auth.token?.value)
          this.total = totals?.grand_total || 0
          return
        }
        const response = await fetch(`${process.env.COMMERCE_API_URL}/carts/mine/totals`, { headers: { Authorization: `Bearer ${auth.token.value}` } })
        if (!response.ok) throw new CartError('Failed to get cart totals', 'CART_ERROR')
        const totals = await response.json()
        this.total = totals.grand_total
      } catch (err) {
        console.error('Error calculating totals:', err)
      }
    },

    async clearCart() {
      const loading = useLoading()
      loading.startLoading('Clearing cart...')
      try {
        const auth = useAuth()
        if (this.quoteId) {
          if (this.client && typeof this.client.clearCart === 'function') {
            await this.client.clearCart(this.quoteId, auth.token?.value)
          } else {
            const response = await fetch(`${process.env.COMMERCE_API_URL}/carts/mine/clear`, { method: 'POST', headers: { Authorization: `Bearer ${auth.token.value}` } })
            if (!response.ok) throw new CartError('Failed to clear cart', 'CART_ERROR')
          }
        }
        this.items = []
        this.total = 0
        this.quoteId = null
        const cache = useCache()
        this.items.forEach(item => cache.setCacheItem(`cart_product_${item.sku}`, null))
        loading.stopLoading()
        useNotification().show({ type: 'success', message: 'Cart cleared successfully' })
      } catch (err) {
        loading.stopLoading()
        console.error(err)
      }
    },

    async syncCartWithCommerce() {
      try {
        const auth = useAuth()
        if (this.client && typeof this.client.listItems === 'function') {
          this.items = await this.client.listItems(this.quoteId, auth.token?.value)
          await this.calculateTotal()
          return
        }
        const response = await fetch(`${process.env.COMMERCE_API_URL}/carts/mine/items`, { headers: { Authorization: `Bearer ${auth.token.value}` } })
        if (!response.ok) throw new CartError('Failed to sync cart', 'CART_ERROR')
        this.items = await response.json()
        await this.calculateTotal()
      } catch (err) {
        console.error(err)
      }
    },

    async validateCart() {
      try {
        for (const item of this.items) {
          const inventory = useInventory()
          const isAvailable = await inventory.checkInventory(item.sku, item.qty)
          if (!isAvailable) throw new CartError(`${item.name} is out of stock`, 'INVENTORY_ERROR')
        }
        await this.syncCartWithCommerce()
        return true
      } catch (err) {
        console.error(err)
        return false
      }
    }
  }
})
