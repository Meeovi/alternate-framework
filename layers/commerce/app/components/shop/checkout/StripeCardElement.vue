<template>
  <v-form @submit.prevent="handlePayment" aria-label="Stripe payment form" ref="formRef">
    <div ref="cardElement" class="StripeElement" aria-label="Card input"></div>
    <div v-if="cardError" class="stripe-error" role="alert">{{ cardError }}</div>
    <v-row class="stripe-details">
      <v-col cols="12" md="6">
        <v-text-field v-model="billingDetails.name" label="Name on Card" required autocomplete="cc-name" outlined />
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field v-model="billingDetails.email" label="Email" type="email" required autocomplete="email" outlined />
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field v-model="billingDetails.phone" label="Phone" type="tel" autocomplete="tel" outlined />
      </v-col>
      <v-col cols="12" md="6">
        <v-select v-model="billingDetails.address.country" :items="countryOptions" label="Country" required outlined />
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field v-model="billingDetails.address.line1" label="Address" required outlined />
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field v-model="billingDetails.address.city" label="City" required outlined />
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field v-model="billingDetails.address.state" label="State" required outlined />
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field v-model="billingDetails.address.postal_code" label="Postal Code" required outlined />
      </v-col>
    </v-row>
    <v-row class="stripe-details">
      <v-col cols="12" md="6">
        <v-text-field v-model="shippingDetails.name" label="Shipping Name" required outlined />
      </v-col>
      <v-col cols="12" md="6">
        <v-select v-model="shippingDetails.address.country" :items="countryOptions" label="Shipping Country" required outlined />
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field v-model="shippingDetails.address.line1" label="Shipping Address" required outlined />
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field v-model="shippingDetails.address.city" label="Shipping City" required outlined />
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field v-model="shippingDetails.address.state" label="Shipping State" required outlined />
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field v-model="shippingDetails.address.postal_code" label="Shipping Postal Code" required outlined />
      </v-col>
    </v-row>
    <v-checkbox v-model="saveCard" label="Save card for future payments (secure)" class="mb-4" />
    <v-btn type="submit" :disabled="loading || !cardReady" aria-busy="loading">
      <span v-if="loading">Processing...</span>
      <span v-else>Pay</span>
    </v-btn>
  </v-form>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import { v-btn } from '@storefront-ui/vue';
import { useUserStore } from '../../stores/user';
import { useDirectusAuth } from '../../../../../composables/useDirectusAuth';
import countryList from '../../utils/countryList'; // Assume this is an array of country codes/names

const props = defineProps<{ clientSecret: string }>();
const emit = defineEmits(['payment-success', 'payment-error']);

const cardElement = ref<HTMLElement | null>(null);
let card: any = null;
let elements: any = null;
const loading = ref(false);
const cardError = ref('');
const cardReady = ref(false);
const saveCard = ref(false);
const formRef = ref();

const userStore = useUserStore();
const directusAuth = useDirectusAuth();
const directusUser = computed(() => directusAuth.user || {});

// Prefer Directus user data if available, fallback to store
const user = computed(() => Object.keys(directusUser.value).length ? directusUser.value : userStore.user || {});

const countryOptions = countryList.map((c: any) => ({ text: c.name, value: c.code }));

const billingDetails = ref({
  name: user.value.name || '',
  email: user.value.email || '',
  phone: user.value.phone || '',
  address: {
    line1: user.value.address?.line1 || '',
    city: user.value.address?.city || '',
    state: user.value.address?.state || '',
    postal_code: user.value.address?.postal_code || '',
    country: user.value.address?.country || '',
  },
});
const shippingDetails = ref({
  name: user.value.shippingName || user.value.name || '',
  address: {
    line1: user.value.shippingAddress?.line1 || '',
    city: user.value.shippingAddress?.city || '',
    state: user.value.shippingAddress?.state || '',
    postal_code: user.value.shippingAddress?.postal_code || '',
    country: user.value.shippingAddress?.country || '',
  },
});

function useNuxtApp() {
  // Return a simple wrapper exposing a client-side Stripe instance if available
  return {
    $stripe: (typeof window !== 'undefined' && window.Stripe) ? window.Stripe : null
  };
}
const { $stripe } = useNuxtApp();

onMounted(() => {
  if (!$stripe || !props.clientSecret) return;
  elements = $stripe.elements({ clientSecret: props.clientSecret });
  card = elements.create('card');
  card.mount(cardElement.value);
  card.on('change', (event: any) => {
    cardError.value = event.error ? event.error.message : '';
    cardReady.value = event.complete;
  });
});

onUnmounted(() => {
  if (card) card.destroy();
});

watch(() => props.clientSecret, (newSecret) => {
  if (elements && newSecret) {
    // Re-create card element if clientSecret changes
    if (card) card.destroy();
    card = elements.create('card');
    card.mount(cardElement.value);
    card.on('change', (event: any) => {
      cardError.value = event.error ? event.error.message : '';
      cardReady.value = event.complete;
    });
  }
});

const handlePayment = async () => {
  cardError.value = '';
  loading.value = true;
  try {
    if (!$stripe || !props.clientSecret) {
      cardError.value = 'Stripe is not initialized.';
      emit('payment-error', cardError.value);
      return;
    }
    // Validate form before submitting
    if (formRef.value && !(await formRef.value.validate?.())) {
      loading.value = false;
      return;
    }
    const { error, paymentIntent, setupIntent } = await $stripe.confirmCardPayment(props.clientSecret, {
      payment_method: {
        card: card,
        billing_details: billingDetails.value,
      },
      shipping: shippingDetails.value,
      setup_future_usage: saveCard.value ? 'off_session' : undefined, // Save card if checked
      // 3D Secure is handled automatically by Stripe if required
    });
    if (error) {
      cardError.value = error.message || 'Payment failed.';
      emit('payment-error', cardError.value);
      return;
    }
    if (paymentIntent && paymentIntent.status === 'succeeded') {
      emit('payment-success', paymentIntent);
    } else if (setupIntent && setupIntent.status === 'succeeded') {
      emit('payment-success', setupIntent);
    } else {
      cardError.value = 'Payment was not successful.';
      emit('payment-error', cardError.value);
    }
  } catch (e: any) {
    cardError.value = e?.message || 'An unexpected error occurred.';
    emit('payment-error', cardError.value);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.StripeElement {
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 1rem;
}
.stripe-error {
  color: #d32f2f;
  margin-bottom: 1rem;
  font-size: 0.95em;
}
.stripe-details {
  margin-bottom: 1rem;
}
</style>