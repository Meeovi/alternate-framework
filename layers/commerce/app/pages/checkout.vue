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
import { loadStripe } from '@stripe/stripe-js'

const checkoutRef = ref(null)
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const stripe = await loadStripe(process.env.NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
    
    const { clientSecret } = await $fetch('/api/create-checkout-session', {
      method: 'POST'
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
</script>