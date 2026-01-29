import { ref, computed, readonly } from 'vue'
import type { Cart, CartItem, Product } from '../types'
import { useCart } from '../cart/useCart'
import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', () => {
  const cart = ref<Cart | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  // Import cart composable
  const { 
    fetchCart, 
    addToCart, 
    removeFromCart, 
    updateCartItem, 
    applyCoupon, 
    removeCoupon, 
    clearCart,
    setShippingOption: setShippingOptionFn
    ,createCheckoutSession: createCheckoutSessionFn
  } = useCart() as any
  
  const initializeCart = async () => {
    loading.value = true
    error.value = null
    try {
      await fetchCart()
    } catch (err: any) {
      error.value = err.message
      console.error('Error initializing cart:', err)
    } finally {
      loading.value = false
    }
  }
  
  const addProductToCart = async (productId: string, quantity: number = 1, variantId?: string) => {
    loading.value = true
    error.value = null
    try {
      await addToCart(productId, quantity, variantId)
    } catch (err: any) {
      error.value = err.message
      console.error('Error adding product to cart:', err)
      throw err
    } finally {
      loading.value = false
    }
  }
  
  const removeProductFromCart = async (itemId: string) => {
    loading.value = true
    error.value = null
    try {
      await removeFromCart(itemId)
    } catch (err: any) {
      error.value = err.message
      console.error('Error removing product from cart:', err)
      throw err
    } finally {
      loading.value = false
    }
  }
  
  const updateProductQuantity = async (itemId: string, quantity: number) => {
    loading.value = true
    error.value = null
    try {
      await updateCartItem(itemId, quantity)
    } catch (err: any) {
      error.value = err.message
      console.error('Error updating cart item:', err)
      throw err
    } finally {
      loading.value = false
    }
  }
  
  const applyCartCoupon = async (couponCode: string) => {
    loading.value = true
    error.value = null
    try {
      const success = await applyCoupon(couponCode)
      if (!success) {
        throw new Error('Failed to apply coupon')
      }
    } catch (err: any) {
      error.value = err.message
      console.error('Error applying coupon:', err)
      throw err
    } finally {
      loading.value = false
    }
  }
  
  const removeCartCoupon = async () => {
    loading.value = true
    error.value = null
    try {
      await removeCoupon()
    } catch (err: any) {
      error.value = err.message
      console.error('Error removing coupon:', err)
      throw err
    } finally {
      loading.value = false
    }
  }
  
  const emptyCart = async () => {
    loading.value = true
    error.value = null
    try {
      await clearCart()
    } catch (err: any) {
      error.value = err.message
      console.error('Error clearing cart:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const setShippingOption = async (option: any) => {
    loading.value = true
    error.value = null
    try {
      if (!setShippingOptionFn) throw new Error('Shipping setter unavailable')
      await setShippingOptionFn(option)
    } catch (err: any) {
      error.value = err.message
      console.error('Error setting shipping option:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createCheckoutSession = async (cartId?: string) => {
    loading.value = true
    error.value = null
    try {
      const data = await createCheckoutSessionFn(cartId)
      return data
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }
  
  // Computed properties
  const itemCount = computed(() => {
    return cart.value?.items?.reduce((count: any, item: { quantity: any }) => count + item.quantity, 0) || 0
  })
  
  const isEmpty = computed(() => {
    return !cart.value?.items?.length
  })
  
  const hasItems = computed(() => {
    return !isEmpty.value
  })
  
  const subtotal = computed(() => {
    return cart.value?.subtotal || 0
  })
  
  const total = computed(() => {
    return cart.value?.total || 0
  })
  
  const taxAmount = computed(() => {
    return cart.value?.tax_amount || 0
  })
  
  const shippingAmount = computed(() => {
    return cart.value?.shipping_amount || 0
  })
  
  const discountAmount = computed(() => {
    return cart.value?.discount_amount || 0
  })
  
  const hasCoupon = computed(() => {
    return !!cart.value?.coupon_code
  })
  
  return {
    // State
    cart: readonly(cart),
    loading: readonly(loading),
    error: readonly(error),
    
    // Computed
    itemCount,
    isEmpty,
    hasItems,
    subtotal,
    total,
    taxAmount,
    shippingAmount,
    discountAmount,
    hasCoupon,
    
    // Actions
    initializeCart,
    addProductToCart,
    removeProductFromCart,
    updateProductQuantity,
    applyCartCoupon,
    removeCartCoupon,
    emptyCart
    ,setShippingOption
    ,createCheckoutSession
  }
})