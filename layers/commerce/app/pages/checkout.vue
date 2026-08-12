<template>
  <div class="checkoutPage">
    <div v-if="cartEmpty" class="error">Your cart is empty</div>

    <template v-else>
      <!-- Step 1: shipping address -->
      <form v-if="step === 'address'" class="checkoutStep" @submit.prevent="fetchRates">
        <h2>Shipping address</h2>
        <div v-if="addressError" class="error">{{ addressError }}</div>

        <label>Full name
          <input v-model="address.name" required autocomplete="name" />
        </label>
        <label>Address line 1
          <input v-model="address.street1" required autocomplete="address-line1" />
        </label>
        <label>Address line 2
          <input v-model="address.street2" autocomplete="address-line2" />
        </label>
        <div class="row">
          <label>City
            <input v-model="address.city" required autocomplete="address-level2" />
          </label>
          <label>State / region
            <input v-model="address.state" required autocomplete="address-level1" />
          </label>
        </div>
        <div class="row">
          <label>ZIP / postal code
            <input v-model="address.zip" required autocomplete="postal-code" />
          </label>
          <label>Country (2-letter code)
            <input v-model="address.country" required maxlength="2" autocomplete="country" />
          </label>
        </div>
        <label>Phone
          <input v-model="address.phone" autocomplete="tel" />
        </label>
        <label>Email
          <input v-model="address.email" type="email" autocomplete="email" />
        </label>

        <button type="submit" :disabled="fetchingRates">
          {{ fetchingRates ? 'Getting shipping rates…' : 'Continue to shipping options' }}
        </button>
      </form>

      <!-- Step 2: choose a shipping rate -->
      <div v-else-if="step === 'rates'" class="checkoutStep">
        <h2>Shipping method</h2>
        <div v-if="ratesError" class="error">{{ ratesError }}</div>

        <div v-if="rates.length === 0 && !ratesError" class="error">
          No shipping rates available for this address.
        </div>

        <label v-for="rate in rates" :key="rate.object_id" class="rateOption">
          <input type="radio" name="rate" :value="rate.object_id" v-model="selectedRateId" />
          <span class="rateName">{{ rate.provider }} {{ rate.servicelevel_name || rate.servicelevel?.name }}</span>
          <span class="rateEta" v-if="rate.estimated_days">{{ rate.estimated_days }} business day{{ rate.estimated_days === 1 ? '' : 's' }}</span>
          <span class="rateAmount">{{ rate.currency }} {{ rate.amount }}</span>
        </label>

        <div class="checkoutActions">
          <button type="button" class="secondary" @click="step = 'address'">Back</button>
          <button type="button" :disabled="!selectedRateId || startingPayment" @click="startPayment">
            {{ startingPayment ? 'Loading payment…' : 'Continue to payment' }}
          </button>
        </div>
      </div>

      <!-- Step 3: payment -->
      <div v-else>
        <div v-if="loading" class="loading">Setting up checkout...</div>
        <div v-else-if="error" class="error">{{ error }}</div>
        <div id="checkout" ref="checkoutRef"></div>
      </div>
    </template>
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
  const loading = ref(false)
  const error = ref('')
  const config = useRuntimeConfig()
  const cartStore = useCartStore()

  const cartEmpty = computed(() => cartStore.items.length === 0)

  const step = ref('address')

  const address = ref({
    name: '',
    street1: '',
    street2: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
    phone: '',
    email: ''
  })
  const addressError = ref('')
  const fetchingRates = ref(false)

  const rates = ref([])
  const ratesError = ref('')
  const selectedRateId = ref(null)
  const startingPayment = ref(false)

  const fetchRates = async () => {
    addressError.value = ''
    ratesError.value = ''
    fetchingRates.value = true
    try {
      // A single default parcel — real per-product weight isn't available
      // from the catalog API this storefront currently has access to, so
      // this estimates from item count rather than leaving shipping
      // unwired entirely. Revisit once product weight is readable.
      const totalItems = cartStore.items.reduce((sum, item) => sum + Number(item.quantity ?? item.qty ?? 1), 0)
      const estimatedWeightLb = Math.max(1, totalItems)

      const { rates: fetchedRates } = await $fetch('/api/shipment/rates', {
        method: 'POST',
        body: {
          address_to: {
            name: address.value.name,
            street1: address.value.street1,
            street2: address.value.street2 || undefined,
            city: address.value.city,
            state: address.value.state,
            zip: address.value.zip,
            country: address.value.country.toUpperCase(),
            phone: address.value.phone || undefined,
            email: address.value.email || undefined
          },
          parcels: [{
            length: '10',
            width: '10',
            height: '10',
            distance_unit: 'in',
            weight: String(estimatedWeightLb),
            mass_unit: 'lb'
          }]
        }
      })

      rates.value = fetchedRates || []
      step.value = 'rates'
    } catch (err) {
      addressError.value = err?.data?.statusMessage || 'Could not validate this address. Please check it and try again.'
    } finally {
      fetchingRates.value = false
    }
  }

  const startPayment = async () => {
    startingPayment.value = true
    error.value = ''
    step.value = 'payment'
    loading.value = true

    try {
      const stripe = await loadStripe(config.public.stripePublishableKey)

      // The server resolves each item's real price from the catalog by id,
      // and re-resolves the shipping rate's real amount from Shippo by id —
      // neither is trusted from this page.
      const items = cartStore.items.map((item) => ({
        id: String(item.productId ?? item.id),
        quantity: Number(item.quantity ?? item.qty ?? 1)
      }))

      const {
        clientSecret
      } = await $fetch('/api/payment/stripe/checkout-session', {
        method: 'POST',
        // Discount codes are entered and validated inside Stripe's own
        // checkout UI (allowPromotionCodes) rather than a custom coupon
        // system — Stripe is the trusted source for whether a code is
        // valid and what it discounts, the same way it's the trusted
        // source for prices.
        body: { items, shippoRateId: selectedRateId.value, allowPromotionCodes: true }
      })

      const checkout = await stripe.initEmbeddedCheckout({
        clientSecret
      })

      checkout.mount('#checkout')
      loading.value = false
    } catch (err) {
      error.value = 'Failed to load checkout'
      loading.value = false
    } finally {
      startingPayment.value = false
    }
  }

  definePageMeta({
    layout: 'nolive',
  });
</script>

<style scoped>
  .checkoutPage {
    max-width: 480px;
    margin: 0 auto;
    padding: 24px 16px;
  }

  .checkoutStep h2 {
    margin-bottom: 16px;
  }

  .checkoutStep label {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 14px;
    font-size: 14px;
  }

  .checkoutStep .row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .checkoutStep input {
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 15px;
  }

  .checkoutStep button {
    padding: 12px 16px;
    border-radius: 4px;
    border: 0;
    background: #5469d4;
    color: #fff;
    font-weight: 600;
    cursor: pointer;
  }

  .checkoutStep button:disabled {
    opacity: 0.6;
    cursor: default;
  }

  .checkoutStep button.secondary {
    background: transparent;
    color: #5469d4;
    border: 1px solid #5469d4;
  }

  .checkoutActions {
    display: flex;
    gap: 12px;
    margin-top: 16px;
  }

  .rateOption {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    margin-bottom: 8px;
    cursor: pointer;
  }

  .rateName {
    flex: 1;
  }

  .rateEta {
    color: #666;
    font-size: 13px;
  }

  .rateAmount {
    font-weight: 600;
  }

  .error {
    color: #df1b41;
    margin-bottom: 12px;
  }
</style>
