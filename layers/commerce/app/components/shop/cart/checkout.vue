<template>
    <div class="checkout-form">
        <form @submit.prevent="handleSubmit">
            <div v-if="error" class="error-message">
                {{ error }}
            </div>

            <!-- Shipping Address -->
            <div class="form-section">
                <h3>Shipping Address</h3>
                <div class="form-row">
                    <div class="form-group">
                        <label for="shipping-firstname">First Name*</label>
                        <input 
                            id="shipping-firstname"
                            v-model="shippingAddress.firstname"
                            type="text"
                            required
                        />
                    </div>
                    <div class="form-group">
                        <label for="shipping-lastname">Last Name*</label>
                        <input 
                            id="shipping-lastname"
                            v-model="shippingAddress.lastname"
                            type="text"
                            required
                        />
                    </div>
                </div>
                <div class="form-group">
                    <label for="shipping-street">Street Address*</label>
                    <input 
                        id="shipping-street"
                        v-model="shippingAddress.street[0]"
                        type="text"
                        required
                    />
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="shipping-city">City*</label>
                        <input 
                            id="shipping-city"
                            v-model="shippingAddress.city"
                            type="text"
                            required
                        />
                    </div>
                    <div class="form-group">
                        <label for="shipping-postcode">Postcode*</label>
                        <input 
                            id="shipping-postcode"
                            v-model="shippingAddress.postcode"
                            type="text"
                            required
                        />
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="shipping-country">Country*</label>
                        <select 
                            id="shipping-country"
                            v-model="shippingAddress.country_code"
                            required
                        >
                            <option value="">Select Country</option>
                            <option v-for="country in countries" :key="country.id" :value="country.id">
                                {{ country.full_name_locale }}
                            </option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="shipping-telephone">Phone Number*</label>
                        <input 
                            id="shipping-telephone"
                            v-model="shippingAddress.telephone"
                            type="tel"
                            required
                        />
                    </div>
                </div>
            </div>

            <!-- Shipping Methods -->
            <div class="form-section">
                <h3>Shipping Method</h3>
                <ShippingOptions v-model="selectedShipping" />
            </div>

            <!-- Billing Address -->
            <div class="form-section">
                <h3>Billing Address</h3>
                <div class="form-check">
                    <input 
                        type="checkbox"
                        id="same-as-shipping"
                        v-model="sameAsShipping"
                    />
                    <label for="same-as-shipping">Same as shipping address</label>
                </div>
                <div v-if="!sameAsShipping">
                    <!-- Billing address fields (same structure as shipping) -->
                    <div class="form-row">
                        <div class="form-group">
                            <label for="billing-firstname">First Name*</label>
                            <input 
                                id="billing-firstname"
                                v-model="billingAddress.firstname"
                                type="text"
                                required
                            />
                        </div>
                        <div class="form-group">
                            <label for="billing-lastname">Last Name*</label>
                            <input 
                                id="billing-lastname"
                                v-model="billingAddress.lastname"
                                type="text"
                                required
                            />
                        </div>
                    </div>
                    <!-- Add other billing address fields similar to shipping -->
                </div>
            </div>

            <!-- Payment Section -->
            <div class="form-section">
                <h3>Payment</h3>
                <p>You will be redirected to a secure Stripe Checkout page to complete payment.</p>
            </div>

            <!-- Order Summary -->
            <div class="form-section">
                <h3>Order Summary</h3>
                <div class="order-summary">
                    <div class="summary-row">
                        <span>Subtotal:</span>
                        <span>{{ formatPrice(cart.subtotal) }}</span>
                    </div>
                    <div class="summary-row">
                        <span>Shipping:</span>
                        <span>{{ formatPrice(cart.shipping) }}</span>
                    </div>
                    <div class="summary-row">
                        <span>Tax:</span>
                        <span>{{ formatPrice(cart.tax) }}</span>
                    </div>
                    <div class="summary-row total">
                        <span>Total:</span>
                        <span>{{ formatPrice(cart.total) }}</span>
                    </div>
                </div>
            </div>

            <button class="submit-button" type="submit" :disabled="loading">
                <span v-if="loading">Processing...</span>
                <span v-else>Pay {{ formatPrice(cart.total) }}</span>
            </button>
        </form>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { loadStripe } from '@stripe/stripe-js'
import { useCartStore } from '~/stores/cart'
import ShippingOptions from '../../catalog/product/shippingOptions.vue'

// Component state
const loading = ref(false)
const error = ref(null)
const sameAsShipping = ref(true)

const shippingAddress = ref({
    firstname: '',
    lastname: '',
    street: [''],
    city: '',
    region: { code: '', label: '' },
    postcode: '',
    country_code: '',
    telephone: ''
})

const billingAddress = ref({
    firstname: '',
    lastname: '',
    street: [''],
    city: '',
    region: { code: '', label: '' },
    postcode: '',
    country_code: '',
    telephone: ''
})

// Cart store
const cartStore = useCartStore()
const cart = computed(() => cartStore.cart ?? { subtotal: 0, tax_amount: 0, shipping_amount: 0, total: 0, currency: 'USD' })

// Selected shipping (v-model) bound to ShippingOptions
const selectedShipping = computed({
    get: () => cartStore.cart?.shipping_method_id ?? cartStore.cart?.shipping_method ?? null,
    set: async (val) => {
        try {
            if (cartStore && cartStore.setShippingOption) {
                await cartStore.setShippingOption({ id: val })
            }
        } catch (e) {
            // eslint-disable-next-line no-console
            console.warn('Failed to set shipping from checkout', e)
        }
    }
})

const nuxtApp = useNuxtApp()

// Watch for same as shipping changes
watch(sameAsShipping, (newValue) => {
    if (newValue) {
        billingAddress.value = { ...shippingAddress.value }
    }
})

// We use Stripe Checkout (server-created session) instead of client Payment Element

// Handle form submission: persist addresses to Directus cart record and proceed to Stripe
const handleSubmit = async () => {
    try {
        loading.value = true
        error.value = null

        const cartId = cartStore.cart?.id
        if (!cartId) throw new Error('Cart not found')

        // Persist addresses to cart
        try {
            const payload = {
                shipping_address: shippingAddress.value,
                billing_address: sameAsShipping.value ? shippingAddress.value : billingAddress.value,
                updated_at: new Date().toISOString()
            }
            await nuxtApp.$directus.request(nuxtApp.$updateItem('cart', cartId, payload))
            await cartStore.fetchCart()
        } catch (e) {
            console.warn('Failed to persist addresses to Directus cart', e)
        }

        // Create Stripe Checkout session via server API
        const data = await cartStore.createCheckoutSession(cartId)
        if (data?.url) {
            window.location.href = data.url
            return
        }

        if (data?.id) {
            // fallback: try client redirect using session id
            const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
            if (!stripeKey) throw new Error('Stripe publishable key missing')
            const stripe = await loadStripe(stripeKey)
            await stripe.redirectToCheckout({ sessionId: data.id })
            return
        }

        throw new Error('Failed to create checkout session')
    } catch (err) {
        error.value = err?.message || 'Payment failed. Please try again.'
        console.error('Checkout error:', err)
    } finally {
        loading.value = false
    }
}

// Directory (countries)
import { useDirectory } from '../../composables/sales/useDirectory'
const { getCountries } = useDirectory()
const countries = ref([])
onMounted(async () => {
    try {
        countries.value = await getCountries()
    } catch (e) {
        // ignore
    }
})

// Format price helper - accepts numbers or objects { value, currency }
const formatPrice = (price) => {
    let amount = 0
    let currency = 'USD'
    if (!price) return '$0.00'
    if (typeof price === 'number') {
        amount = price
    } else if (price && typeof price === 'object') {
        amount = Number(price.value ?? price.amount ?? 0)
        currency = price.currency ?? price.currency_code ?? 'USD'
    }
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: (currency || 'USD').toUpperCase() }).format(amount)
}
// initializeStripe is invoked onMounted above
</script>

<style scoped>
.checkout-form {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
}

.form-section {
    margin-bottom: 2rem;
    padding: 1.5rem;
    border: 1px solid #e6e6e6;
    border-radius: 8px;
}

.form-section h3 {
    margin-bottom: 1rem;
    font-size: 1.25rem;
    font-weight: 600;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1rem;
}

.form-group {
    margin-bottom: 1rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
}

.form-group input,
.form-group select {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #e6e6e6;
    border-radius: 4px;
    font-size: 1rem;
}

.form-check {
    margin-bottom: 1rem;
}

.error-message {
    color: #df1b41;
    margin-bottom: 16px;
    padding: 12px;
    border-radius: 4px;
    background-color: #fff0f0;
}

.submit-button {
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
    box-shadow: 0px 4px 5.5px 0px rgba(0, 0, 0, 0.07);
    margin-top: 24px;
}

.submit-button:hover {
    filter: brightness(1.1);
}

.submit-button:disabled {
    opacity: 0.5;
    cursor: default;
    background-color: #7795f8;
}

.order-summary {
    margin-top: 1rem;
    padding: 1rem;
    background-color: #f8f9fa;
    border-radius: 4px;
}

.summary-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
}

.summary-row.total {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #e6e6e6;
    font-weight: 600;
    font-size: 1.1rem;
}

:deep(.stripe-element) {
    padding: 12px;
    border: 1px solid #e6e6e6;
    border-radius: 4px;
    background: white;
}
</style>