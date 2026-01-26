import {
  CommerceCart,
  CommerceCartItem,
  CommercePrice,
} from '@meeovi/types'
import { Cart, CartItemInterface } from '../client/sdk'
import { mapMagentoProduct } from './product'

function mapMagentoCartItem(item: CartItemInterface): CommerceCartItem {
  const price: CommercePrice = {
    amount: item.prices?.price?.value ?? 0,
    currency: item.prices?.price?.currency ?? 'USD',
  }

  return {
    id: item.uid,
    productId: item.product.uid,
    quantity: item.quantity,
    price,
  }
}

export function mapMagentoProductInCart(item: CartItemInterface) {
  return mapMagentoProduct(item.product)
}

export function mapMagentoCart(cart: Cart): CommerceCart {
  const items: CommerceCartItem[] = ((cart.items ?? []) as CartItemInterface[]).map(mapMagentoCartItem)

  const total: CommercePrice = {
    amount: cart.prices?.grand_total?.value ?? 0,
    currency: cart.prices?.grand_total?.currency ?? 'USD',
  }

  return {
    id: cart.id,
    items,
    total,
  }
}