<template>
  <div>
    <h1>Checkout</h1>
    <v-btn @click="startCheckout" :disabled="loading || !clientSecret">
      Pay with Stripe
    </v-btn>
    <StripeCardElement v-if="clientSecret" :clientSecret="clientSecret" @payment-success="onPaymentSuccess" />
  </div>
</template>



<script setup>

import { ref } from '#imports';
import { useCommerceQuery } from '../../../composables/globals/useCommerceQuery';
import { useCommerceMutation } from '../../../composables/globals/useCommerceMutation';
import StripeCardElement from './StripeCardElement.vue';

const loading = ref(false);
const clientSecret = ref<string | null>(null);

// Get the active order (cart)
const { data: orderData, refetch } = useCommerceQuery('getActiveOrder');

const { mutate: createStripePaymentIntent } = useCommerceMutation('createStripePaymentIntent');

const startCheckout = async () => {
  if (!orderData.value?.activeOrder) return;
  loading.value = true;
  try {
    // Create payment intent on the server via Commerce mutation
    const response = await createStripePaymentIntent({
      orderId: orderData.value.activeOrder.id,
    });
    clientSecret.value = response?.createStripePaymentIntent?.clientSecret;
  } catch (err) {
    // Handle error (show notification, etc.)
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const onPaymentSuccess = () => {
  // Optionally refetch order/cart, show success notification, etc.
  refetch();
};
</script>
