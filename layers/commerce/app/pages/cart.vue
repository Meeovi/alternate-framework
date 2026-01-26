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
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { useCartStore } from '~/stores/cart'
  
  import ShippingOptions from '../components/catalog/product/shippingOptions.vue'
  import { ref, computed } from 'vue'

  const cart = useCartStore()
  const loading = ref(false)

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
    if (!cart || !cart.createCheckoutSession) return
    try {
      loading.value = true
      const data = await cart.createCheckoutSession(cart.cart?.id)
      const url = data?.url || (data?.id ? `https://checkout.stripe.com/pay/${data.id}` : null)
      if (url) {
        window.location.href = url
      } else if (data && data.id) {
        // fallback: use injected Stripe instance from plugin if available
        const nuxtApp = useNuxtApp()
        const injectedStripe = nuxtApp?.$stripe || null
        if (injectedStripe && typeof injectedStripe.redirectToCheckout === 'function') {
          await injectedStripe.redirectToCheckout({ sessionId: data.id })
        } else if (window && window.Stripe) {
          // last-resort: use global Stripe if present
          const publishable = (useRuntimeConfig() || {}).public?.stripe?.publishableKey || null
          if (publishable) {
            const stripe = window.Stripe(publishable)
            await stripe.redirectToCheckout({ sessionId: data.id })
          } else {
            console.warn('No Stripe publishable key available for client-side redirect')
          }
        } else {
          console.warn('No client Stripe instance available for redirect')
        }
      } else {
        console.warn('No checkout url returned from server')
      }
    } catch (e) {
      console.error('Failed to start checkout', e)
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
  </style>
  