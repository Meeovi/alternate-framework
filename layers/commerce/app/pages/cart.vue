<!-- pages/cart.vue -->
<template>
    <div class="cartPage">
      <h2>Shopping Cart</h2>
      
      <div v-if="cart.items.length === 0" class="empty-cart">
        Your cart is empty
      </div>
      
      <div v-else>
        <div v-for="item in cart.items" :key="item.id" class="cart-item">
          <div class="item-details">
            <h3>{{ item.name }}</h3>
            <p>Price: ${{ item.price }}</p>
            <p>Quantity: {{ item.quantity }}</p>
          </div>
          <v-btn @click="cart.removeItem(item.id)" color="error">
            Remove
          </v-btn>
        </div>
        
        <div class="cart-total">
          <h3>Total: ${{ cart.total }}</h3>
        </div>

        <!-- Shipping selection -->
        <div class="cart-shipping my-4">
          <ShippingOptions v-model="selectedShipping" />
        </div>

        <div class="cart-actions mt-4">
          <v-btn
            color="primary"
            :disabled="cart.items.length === 0 || loading"
            @click="startCheckout"
          >
            <span v-if="!loading">Checkout</span>
            <span v-else>Preparing...</span>
          </v-btn>

          <PayPalButtons
            @payment-success="handlePaymentSuccess"
            @payment-error="handlePaymentError"
          />

          <p v-if="checkoutError" class="checkout-error mt-2">
            {{ checkoutError }}
          </p>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { loadStripe } from '@stripe/stripe-js'
  import { useCartStore } from '~/stores/cart'
  
  import ShippingOptions from '../components/catalog/product/shippingOptions.vue'
  import { ref, computed, useNuxtApp } from '#imports'

  const cart = useCartStore()
  const loading = ref(false)
  const checkoutError = ref('')

  const selectedShipping = computed({
    get: () => cart.cart?.shipping_method_id ?? cart.cart?.shipping_method ?? null,
    set: async (val) => {
      try {
        // Let the component/composable persist to the cart store; call store as a fallback
        if (cart && cart.setShippingOption) {
          await cart.setShippingOption({ id: val })
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('Failed to set shipping from cart page', e)
      }
    }
  })

  const handlePaymentSuccess = (order) => {
    console.log('Payment successful:', order)
  }

  const handlePaymentError = (error) => {
    console.error('Payment failed:', error)
  }

  const startCheckout = async () => {
    try {
      checkoutError.value = ''
      loading.value = true
      const createCheckoutSession = cart?.createCheckoutSession
      const currentCartId = cart?.cart?.id
      if (typeof createCheckoutSession !== 'function' || !currentCartId) {
        checkoutError.value = 'Checkout is currently unavailable'
        return
      }

      const data = await createCheckoutSession(currentCartId)
      const checkoutUrl = typeof data?.url === 'string' ? data.url.trim() : ''
      if (checkoutUrl) {
        let parsedCheckoutUrl
        try {
          parsedCheckoutUrl = new URL(checkoutUrl)
        } catch {
          checkoutError.value = 'Failed to create checkout session'
          return
        }

        if (parsedCheckoutUrl.protocol !== 'https:') {
          checkoutError.value = 'Failed to create checkout session'
          return
        }

        window.location.assign(parsedCheckoutUrl.toString())
        return
      }

      if (data?.id) {
        const nuxtApp = useNuxtApp()
        const injectedStripe = nuxtApp?.$stripe || null
        if (injectedStripe && typeof injectedStripe.redirectToCheckout === 'function') {
          const result = await injectedStripe.redirectToCheckout({ sessionId: data.id })
          if (result?.error) {
            checkoutError.value = 'Unable to redirect to payment provider'
          }
          return
        }

        const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
        if (!stripeKey || typeof stripeKey !== 'string' || !stripeKey.startsWith('pk_')) {
          checkoutError.value = 'Checkout is currently unavailable'
          return
        }

        const stripe = await loadStripe(stripeKey)
        if (!stripe) {
          checkoutError.value = 'Checkout is currently unavailable'
          return
        }

        const { error: stripeError } = await stripe.redirectToCheckout({ sessionId: data.id })
        if (stripeError) {
          checkoutError.value = 'Unable to redirect to payment provider'
        }
        return
      }

      checkoutError.value = 'Failed to create checkout session'
    } catch (e) {
      checkoutError.value = 'Payment failed. Please try again.'
      if (import.meta.dev) {
        console.error('Failed to start checkout', e)
      } else {
        console.error('Failed to start checkout')
      }
    } finally {
      loading.value = false
    }
  }
  </script>
  
  <style scoped>
  .cartPage {
    padding: 20px;
  }
  
  .cart-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    border-bottom: 1px solid #eee;
  }
  
  .cart-total {
    margin-top: 20px;
    text-align: right;
  }
  
  .empty-cart {
    text-align: center;
    padding: 50px;
  }

  .checkout-error {
    color: #df1b41;
  }
  </style>
  