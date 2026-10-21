<template>
  <div class="checkoutPage">
    <div v-if="cartEmpty" class="error">Your cart is empty</div>

    <template v-else>
      <div v-if="cartStore.loading && step === 'address'" class="loading">Loading your cart…</div>

      <!-- Nothing ships (virtual/downloadable items only): straight to payment -->
      <div v-else-if="step === 'address' && !needsShipping" class="checkoutStep">
        <h2>Checkout</h2>
        <p>Nothing in your cart needs shipping, so there's no address or delivery to choose.</p>
        <div class="checkoutActions">
          <button type="button" :disabled="startingPayment" @click="startPayment">
            {{ startingPayment ? 'Loading payment…' : 'Continue to payment' }}
          </button>
        </div>
      </div>

      <!-- Step 1: shipping address -->
      <form v-else-if="step === 'address'" class="checkoutStep" @submit.prevent="fetchRates">
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

      <!-- Step 3: payment (PayPal) -->
      <div v-else class="checkoutStep">
        <h2>Payment</h2>
        <div v-if="loading" class="loading">Setting up payment…</div>
        <div v-if="error" class="error">{{ error }}</div>
        <div v-if="paying" class="loading">Completing your payment…</div>
        <paypal-button v-show="paypalReady && !paying" type="pay" @click="pay"></paypal-button>
        <div class="checkoutActions">
          <button type="button" class="secondary" :disabled="paying" @click="step = needsShipping ? 'rates' : 'address'">Back</button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
  import {
    useRuntimeConfig
  } from '#app'
  import { useCartStore } from '../stores/cart'

  const loading = ref(false)
  const error = ref('')
  const config = useRuntimeConfig()
  const cartStore = useCartStore()

  // The cart is server-persisted and the Pinia store only holds what a
  // consumer has fetched this page load — every consumer is responsible
  // for calling fetchCart() from its own onMounted (see the store's own
  // header comment). On a hard navigation straight to /checkout nothing
  // else has populated it, so without this the page renders "Your cart is
  // empty" over a cart that actually has items.
  onMounted(() => { cartStore.fetchCart() })

  // Don't flash the empty-cart message while that first fetch is still in
  // flight — the store starts with loading = true.
  const cartEmpty = computed(() => !cartStore.loading && cartStore.items.length === 0)

  // Items added before the cart recorded this flag count as shippable.
  const needsShipping = computed(() => cartStore.items.some((item) => item.requiresShipping !== false))

  // PayPal's v6 SDK, loaded only once the buyer reaches payment (sandbox or
  // live, the same mode as the server). The instance authenticates with a
  // short-lived client token from the server, so no client id is needed here.
  let paypalSdk = null
  const loadPayPal = () => (paypalSdk ??= new Promise((resolve, reject) => {
    const fail = (message) => { paypalSdk = null; reject(new Error(message)) }
    const timer = setTimeout(() => fail('PayPal SDK did not load'), 20000)
    const script = document.createElement('script')
    script.src = config.public.paypalMode === 'live'
      ? 'https://www.paypal.com/web-sdk/v6/core'
      : 'https://www.sandbox.paypal.com/web-sdk/v6/core'
    script.async = true
    script.onload = () => { clearTimeout(timer); window.paypal ? resolve(window.paypal) : fail('PayPal SDK did not load') }
    script.onerror = () => { clearTimeout(timer); script.remove(); fail('PayPal SDK did not load') }
    document.head.appendChild(script)
  }))
  const paypalReady = ref(false)
  const paying = ref(false)
  let paymentSession = null

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
    if (paymentSession) {
      startingPayment.value = false
      return
    }
    loading.value = true

    try {
      const { clientToken } = await $fetch('/api/payment/paypal/client')
      const paypal = await loadPayPal()
      const sdk = await paypal.createInstance({ clientToken, components: ['paypal-payments'], pageType: 'checkout' })
      const methods = await sdk.findEligibleMethods({ currencyCode: 'USD' })
      if (!methods.isEligible('paypal')) throw new Error('PayPal is not available here')
      paymentSession = sdk.createPayPalOneTimePaymentSession({
        onApprove,
        onCancel: () => { error.value = 'Payment cancelled — you have not been charged.' },
        onError: () => { error.value = 'PayPal ran into a problem. You have not been charged; please try again.' },
      })
      paypalReady.value = true
    } catch (err) {
      error.value = 'Payment could not be loaded. Please try again.'
    } finally {
      loading.value = false
      startingPayment.value = false
    }
  }

  // The server prices each item from the catalogue by id and re-fetches the
  // shipping rate's amount from Shippo by id — nothing here sets a price.
  const createOrder = () => $fetch('/api/payment/paypal/orders', {
    method: 'POST',
    body: {
      items: cartStore.items.map((item) => ({
        id: String(item.productId ?? item.id),
        quantity: Number(item.quantity ?? item.qty ?? 1)
      })),
      ...(needsShipping.value && {
        shippoRateId: selectedRateId.value,
        // The address the rate was quoted for; PayPal ships to it.
        shippingAddress: { ...address.value, country: address.value.country.toUpperCase() },
      }),
      // One PayPal order per click, even if the request is retried.
      idempotencyKey: crypto.randomUUID(),
    }
  }).then(({ orderId }) => ({ orderId }))

  const pay = async () => {
    if (!paymentSession || paying.value) return
    error.value = ''
    try {
      // The SDK opens PayPal straight away and fills it once the order exists.
      await paymentSession.start({ presentationMode: 'auto' }, createOrder())
    } catch (err) {
      error.value = err?.data?.statusMessage || 'PayPal could not be opened. Please try again.'
    }
  }

  async function onApprove ({ orderId }) {
    paying.value = true
    error.value = ''
    try {
      await $fetch('/api/payment/paypal/capture', { method: 'POST', body: { orderId } })
      await navigateTo(`/success?order=${encodeURIComponent(orderId)}`)
    } catch (err) {
      paying.value = false
      // The server says what happened; without an answer (a lost response)
      // the payment may have gone through, so don't claim it didn't.
      error.value = err?.data?.statusMessage || "We couldn't confirm your payment. Please check your orders or email before trying again."
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
