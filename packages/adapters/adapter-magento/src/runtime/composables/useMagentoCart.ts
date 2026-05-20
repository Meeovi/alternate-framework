import { useMagento } from './useMagento'
import { ref } from '#imports'

export function useMagentoCart() {
  const magento = useMagento()
  const cartId = ref<string | number | null>(null)

  const create = async () => {
    cartId.value = await magento.cart?.create?.()
    return cartId.value
  }

  const addItem = async (sku: string, qty = 1) => {
    if (!cartId.value) await create()
    return magento.cart?.addItem?.(cartId.value as string, { sku, qty })
  }

  const get = () => magento.cart?.get?.()

  return {
    cartId,
    create,
    addItem,
    get,
  }
}
