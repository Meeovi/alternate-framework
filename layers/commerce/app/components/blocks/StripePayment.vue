<!-- components/StripePayment.vue -->
<template>
  <ClientOnly>
    <div class="stripe-payment-container">
      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <div v-if="stripeLoaded && clientSecret" class="payment-form">
        <v-form @submit.prevent="handleSubmit">
          <div ref="paymentElement"></div>

          <v-btn type="submit" class="payment-v-btn" :disabled="!stripeLoaded || loading">
            <span v-if="loading">Processing...</span>
            <span v-else>Pay Now</span>
          </v-btn>
        </v-form>
      </div>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { usePayment } from '../../composables/payments/usePayment'

const props = defineProps<{
  orderCode: string
  clientSecret: string
}>()

const { createElements, confirmPayment } = usePayment()

const stripeLoaded = ref(false)
const error = ref<string | null>(null)
const loading = ref(false)
const elements = ref<any>(null)
const paymentElement = ref<HTMLDivElement | null>(null)
const clientSecret = ref<string>(props.clientSecret)

onMounted(async () => {
  try {
    elements.value = await createElements(clientSecret.value, {
      theme: 'stripe',
      variables: {
        colorPrimary: '#0570de',
        colorBackground: '#ffffff',
        colorText: '#30313d',
      },
    })

    if (elements.value && paymentElement.value) {
      const element = elements.value.create('payment')
      element.mount(paymentElement.value as HTMLDivElement)
    }

    stripeLoaded.value = !!elements.value
  } catch (err) {
    error.value = 'Failed to initialize payment provider'
    console.error('Payment initialization error:', err)
  }
})

const handleSubmit = async () => {
  if (!elements.value) {
    return
  }

  try {
    loading.value = true
    error.value = null

    const { error: stripeError } = await confirmPayment(elements.value, {
      return_url: `${window.location.origin}/checkout/confirmation/${props.orderCode}`,
    })

    if (stripeError) {
      error.value = stripeError.message || 'Payment failed'
    }
  } catch (err) {
    error.value = 'An unexpected error occurred'
    console.error('Payment error:', err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
  .stripe-payment-container {
    max-width: 500px;
    margin: 0 auto;
    padding: 20px;
  }

  .error-message {
    color: #df1b41;
    background-color: #fff0f0;
    padding: 12px;
    border-radius: 4px;
    margin-bottom: 16px;
  }

  .payment-form {
    background: #ffffff;
    padding: 20px;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .payment-v-btn {
    background: #5469d4;
    color: #ffffff;
    border: none;
    border-radius: 4px;
    padding: 12px 16px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    display: block;
    width: 100%;
    margin-top: 24px;
    transition: all 0.2s ease;
  }

  .payment-v-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .payment-v-btn:hover:not(:disabled) {
    filter: brightness(1.1);
  }
</style>
