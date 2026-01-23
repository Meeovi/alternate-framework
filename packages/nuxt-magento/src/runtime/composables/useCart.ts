import { useNuxtApp } from "#app";

export const useMagentoCart = () => {

  return {
    create: () => $fetch('/api/magento/cart', { method: 'POST' }),
    add: (payload: { cartId: string; sku: string; qty: number }) =>
      $fetch('/api/magento/cart-add', { method: 'POST', body: payload })
  }
}
