import { getRegistry } from './index';
export const commerce = {
    getProduct: (id) => getRegistry().commerce?.getProduct(id),
    listProducts: () => getRegistry().commerce?.listProducts(),
    getCart: () => getRegistry().commerce?.getCart(),
    addToCart: (item) => getRegistry().commerce?.addToCart(item),
    updateCartItem: (id, qty) => getRegistry().commerce?.updateCartItem(id, qty),
    removeCartItem: (id) => getRegistry().commerce?.removeCartItem(id),
    clearCart: () => getRegistry().commerce?.clearCart()
};
