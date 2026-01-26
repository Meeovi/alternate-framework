<template>
  <div>
    <h1>Checkout</h1>
    <v-btn @click="startCheckout" :disabled="loading || !clientSecret">
      Pay with Stripe
    </v-btn>
    <StripeCardElement v-if="clientSecret" :clientSecret="clientSecret" @payment-success="onPaymentSuccess" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { v-btn } from '@storefront-ui/vue';
import { useVendureQuery } from '@/app/composables/useVendureQuery';
import { useVendureMutation } from '@/app/composables/useVendureMutation';
import createStripePaymentIntentMutation from '#graphql/app/commerce/mutations/createStripePaymentIntent.gql';
import getActiveOrderQuery from '#graphql/app/commerce/queries/getActiveOrder.gql';
import StripeCardElement from './StripeCardElement.vue';

const loading = ref(false);
const clientSecret = ref<string | null>(null);

// Get the active order (cart)
const { data: orderData, refetch } = useVendureQuery(getActiveOrderQuery);

const { mutate: createStripePaymentIntent } = useVendureMutation(createStripePaymentIntentMutation);

const startCheckout = async () => {
  if (!orderData.value?.activeOrder) return;
  loading.value = true;
  try {
    // Create payment intent on the server via Vendure mutation
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
