// commerce-layer/composables/useCart.ts
import { mapGatewayCartToUI, createEmptyUICart } from '../../../../utils/mappers'
import type { UICart } from '../../../../types/commerce'

export const useCart = () => {
  // 1. Resolve the active runtime driver injected via the SDK layer plugin
  const { $commerceDriver } = useNuxtApp() as any
  
  // 2. Share a centralized reactive cart UI state across the app context
  const cartState = useState<UICart>('m_framework_cart', () => createEmptyUICart())
  const isLoading = useState<boolean>('m_framework_cart_loading', () => false)
  const cartError = useState<string | null>('m_framework_cart_error', () => null)

  const fetchCart = async (cartId?: string) => {
    isLoading.value = true
    cartError.value = null
    try {
      const rawCart = await $commerceDriver.cart.getCart(cartId)
      cartState.value = mapGatewayCartToUI(rawCart)
    } catch (err: any) {
      cartError.value = err.message ?? 'Failed to retrieve checkout session'
    } finally {
      isLoading.value = false
    }
  }

  const addItemToCart = async (productId: string, variantId: string, quantity: number) => {
    isLoading.value = true
    try {
      const updatedCart = await $commerceDriver.cart.addToCart({ productId, variantId, quantity })
      cartState.value = mapGatewayCartToUI(updatedCart)
    } catch (err: any) {
      cartError.value = err.message ?? 'Failed to add item'
    } finally {
      isLoading.value = false
    }
  }

  return {
    cart: computed(() => cartState.value),
    isLoading: readonly(isLoading),
    error: readonly(cartError),
    fetchCart,
    addItemToCart
  }
}