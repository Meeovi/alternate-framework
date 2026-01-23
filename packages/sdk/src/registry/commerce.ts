import { getRegistry } from './index'

export const commerce = {
  getProduct: (id: string) => getRegistry().commerce?.getProduct(id),
  listProducts: () => getRegistry().commerce?.listProducts(),
  getCart: () => getRegistry().commerce?.getCart(),
  addToCart: (item: { productId: string; variantId?: string; quantity: number }) => getRegistry().commerce?.addToCart(item),
  updateCartItem: (id: string, qty: number) => getRegistry().commerce?.updateCartItem(id, qty),
  removeCartItem: (id: string) => getRegistry().commerce?.removeCartItem(id),
  clearCart: () => getRegistry().commerce?.clearCart()
}