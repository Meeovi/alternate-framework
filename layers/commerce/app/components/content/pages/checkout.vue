<template>
  <div>
    <v-form id="payment-form">
      <div id="payment-element">
        <!-- Payment Elements will inject the payment form here -->
      </div>
      <v-btn id="submit" :disabled="isLoading">
        <span v-if="isLoading">Processing...</span>
        <span v-else>Pay now</span>
      </v-btn>
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
    </v-form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { usePayment } from '../../composables/payments/usePayment'

const { createElements, confirmPayment, createCheckoutSession } = usePayment()

const clientSecret = ref<string | null>(null)
const elements = ref(null)
const isLoading = ref(false)
const errorMessage = ref('')

// Initialize payment element — fetch clientSecret from server endpoint
onMounted(async () => {
  try {
    const response = await $fetch('/api/payment/stripe/checkout-session', {
      method: 'POST',
      body: {
        items: [],
        mode: 'payment',
        currency: 'usd',
        amount: 1000,
      }
    })

    clientSecret.value = response?.clientSecret || response?.client_secret || null

    if (clientSecret.value) {
      elements.value = await createElements(clientSecret.value, { theme: 'stripe' })

      if (elements.value) {
        const paymentElement = elements.value.create('payment')
        paymentElement.mount('#payment-element')
      }
    }
  } catch (err) {
    console.error('Payment initialization error:', err)
    errorMessage.value = 'Failed to initialize payment form'
  }
})

// Handle form submission
const handleSubmit = async (e) => {
  e.preventDefault()

  if (!elements.value) {
    return
  }

  isLoading.value = true

  try {
    const { error } = await confirmPayment(elements.value, {
      return_url: `${window.location.origin}/payment-completion`,
    })

    if (error) {
      errorMessage.value = error.message
    }
  } catch (e) {
    errorMessage.value = 'An unexpected error occurred.'
  }

  isLoading.value = false
}
</script>

<style scoped>
form {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}

#payment-element {
  margin-bottom: 24px;
}

v-btn {
  background: #5469d4;
  color: #ffffff;
  border-radius: 4px;
  border: 0;
  padding: 12px 16px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: block;
  width: 100%;
  transition: all 0.2s ease;
}

v-btn:hover {
  filter: brightness(1.1);
}

v-btn:disabled {
  opacity: 0.5;
  cursor: default;
}

.error-message {
  color: rgb(205, 53, 53);
  margin-top: 12px;
  text-align: center;
}
</style>
