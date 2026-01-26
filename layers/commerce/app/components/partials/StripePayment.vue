<!-- components/StripePayment.vue -->
<template>
    <div class="stripe-payment-container">
        <div v-if="error" class="error-message">
            {{ error }}
        </div>

        <div v-if="stripe && clientSecret" class="payment-form">
            <form @submit.prevent="handleSubmit">
                <div ref="paymentElement"></div>

                <button type="submit" class="payment-button" :disabled="!stripe || loading">
                    <span v-if="loading">Processing...</span>
                    <span v-else>Pay Now</span>
                </button>
            </form>
        </div>
    </div>
</template>

<script setup lang="ts">
import {
    ref,
    onMounted
} from 'vue'
import type {
    Stripe,
    StripeElements
} from '@stripe/stripe-js'
import {
    loadStripe
} from '@stripe/stripe-js'

const props = defineProps < {
    orderCode: string,
    clientSecret: string
} > ()

const stripe = ref < Stripe | null > (null)
const elements = ref < StripeElements | null > (null)
const error = ref < string | null > (null)
const loading = ref(false)
const paymentElement = ref < HTMLDivElement | null > (null)
const clientSecret = ref < string > (props.clientSecret)

onMounted(async () => {
    try {
        stripe.value = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
        if (stripe.value && clientSecret.value) {
            elements.value = stripe.value.elements({
                clientSecret: clientSecret.value,
                appearance: {
                    theme: 'stripe',
                    variables: {
                        colorPrimary: '#0570de',
                        colorBackground: '#ffffff',
                        colorText: '#30313d'
                    }
                }
            })

            // Create and mount payment element
            if (elements.value && paymentElement.value) {
                const element = elements.value.create('payment')
                element.mount(paymentElement.value as HTMLDivElement)
            }
        }
    } catch (err) {
        error.value = 'Failed to initialize Stripe'
        console.error('Stripe initialization error:', err)
    }
})

const handleSubmit = async () => {
    if (!stripe.value || !elements.value) {
        return
    }

    try {
        loading.value = true
        error.value = null

        const {
            error: stripeError
        } = await stripe.value.confirmPayment({
            elements: elements.value,
            confirmParams: {
                return_url: `${window.location.origin}/checkout/confirmation/${props.orderCode}`,
            },
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

    .payment-button {
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

    .payment-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .payment-button:hover:not(:disabled) {
        filter: brightness(1.1);
    }
</style>