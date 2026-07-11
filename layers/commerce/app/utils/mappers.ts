// commerce-layer/utils/mappers.ts
import type { UICart, CartItem } from '../types/commerce'

export function mapGatewayCartToUI(data: any): UICart {
  if (!data) {
    return createEmptyUICart()
  }

  const items: CartItem[] = (data.items ?? []).map((item: { id: any; productId: any; variantId: any; productName: any; quantity: any; featuredImage: any; price: { regular: any; current: any } }) => ({
    id: item.id,
    productId: item.productId,
    variantId: item.variantId,
    title: item.productName ?? 'Unknown Item',
    quantity: item.quantity,
    image: item.featuredImage ?? '/images/placeholder-product.png',
    price: {
      regular: item.price.regular,
      current: item.price.current,
    },
  }))

  return {
    id: data.id,
    items,
    subtotal: data.totalPrice.regular,
    total: data.totalPrice.current,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
  }
}

export function createEmptyUICart(): UICart {
  const zeroMoney = { value: 0, currencyCode: 'GBP', formatted: '£0.00' }
  return { id: '', items: [], subtotal: zeroMoney, total: zeroMoney, itemCount: 0 }
}