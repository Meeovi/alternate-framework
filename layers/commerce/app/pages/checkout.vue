<template>
  <div>
    <div v-if="loading" class="loading">
      Setting up checkout...
    </div>
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    <div id="checkout" ref="checkoutRef"></div>
  </div>
</template>

<script setup>
  import {
    loadStripe
  } from '@stripe/stripe-js'
  import {
    useRuntimeConfig
  } from '#app'
  import { useCartStore } from '../stores/cart'

  const checkoutRef = ref(null)
  const loading = ref(true)
  const error = ref('')
  const config = useRuntimeConfig()
  const cartStore = useCartStore()

  onMounted(async () => {
    try {
      if (cartStore.items.length === 0) {
        error.value = 'Your cart is empty'
        loading.value = false
        return
      }

      const stripe = await loadStripe(config.public.stripePublishableKey)

      // The server resolves each item's real price from the catalog by id —
      // it never trusts a price sent from here.
      const items = cartStore.items.map((item) => ({
        id: String(item.productId ?? item.id),
        quantity: Number(item.quantity ?? item.qty ?? 1)
      }))

      const {
        clientSecret
      } = await $fetch('/api/payment/stripe/checkout-session', {
        method: 'POST',
        body: { items }
      })

      const checkout = await stripe.initEmbeddedCheckout({
        clientSecret
      })

      checkout.mount('#checkout')
      loading.value = false
    } catch (err) {
      error.value = 'Failed to load checkout'
      loading.value = false
    }
  })

  definePageMeta({
    layout: 'nolive',
  });
</script>