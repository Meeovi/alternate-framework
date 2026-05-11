// types/gateway.d.ts

import type { CartItem, CartTotals } from './commerce'

declare module '#app' {
  interface NuxtApp {
    $gateway: {
      cart: {
        get(): Promise<{ items: CartItem[]; totals: CartTotals }>
        add(productId: string, qty: number): Promise<void>
        remove(itemId: string): Promise<void>
      }
      // You can add more domains later:
      // products: { ... }
      // orders: { ... }
      // vendors: { ... }
    }
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $gateway: NuxtApp['$gateway']
  }
}
