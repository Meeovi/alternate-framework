import type { CartItem, CartTotals, GatewayContract } from '@mframework/core'

function defaultTotals(): CartTotals {
  return {
    subtotal: 0,
    tax: 0,
    shipping: 0,
    discount: 0,
    total: 0,
    currency: 'USD',
  }
}

function computeTotals(items: CartItem[]): CartTotals {
  const subtotal = items.reduce((sum, item) => sum + item.total, 0)
  return {
    subtotal,
    tax: 0,
    shipping: 0,
    discount: 0,
    total: subtotal,
    currency: 'USD',
  }
}

function useCartState() {
  const items = useState<CartItem[]>('mframework:commerce:cart:items', () => [])
  const totals = useState<CartTotals>('mframework:commerce:cart:totals', defaultTotals)
  return { items, totals }
}

export default <GatewayContract & { content?: unknown }>{
  cart: {
    async get() {
      const { items, totals } = useCartState()
      return {
        items: items.value,
        totals: totals.value,
      }
    },
    async add(productId: string, qty: number) {
      const { items, totals } = useCartState()
      const existing = items.value.find(item => item.productId === productId)
      if (existing) {
        existing.quantity += qty
        existing.total = existing.quantity * existing.price
      } else {
        items.value.push({
          id: `${productId}-${Date.now()}`,
          productId,
          name: productId,
          quantity: qty,
          price: 0,
          total: 0,
        })
      }
      totals.value = computeTotals(items.value)
    },
    async remove(itemId: string) {
      const { items, totals } = useCartState()
      items.value = items.value.filter(item => item.id !== itemId)
      totals.value = computeTotals(items.value)
    },
  },
}
