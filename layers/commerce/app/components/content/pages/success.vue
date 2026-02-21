<template>
  <v-container class="text-center">
    <v-row justify="center">
      <v-col cols="12" md="8">
        <UCard class="pa-6">
          <UIcon color="success" size="64" class="mb-4">mdi-check-circle</UIcon>
          <h1 class="text-h4 mb-4">Thank You for Your Purchase!</h1>
          <p class="text-body-1 mb-4">
            Your order has been successfully placed. We've sent a confirmation email to your registered email address.
          </p>
          <p class="text-body-1 mb-6">
            Order ID: {{ orderId }}
          </p>
          <UButton
            color="primary"
            @click="router.push('/')"
            class="mr-4"
          >
            Continue Shopping
          </UButton>
          <UButton
            color="secondary"
            @click="router.push('/orders')"
          >
            View Orders
          </UButton>
        </UCard>
      </v-col>
    </v-row>
  </v-container>
</template>


import { useCommerceAdapter, useContentAdapter } from '#imports'
void useCommerceAdapter()
void useContentAdapter()

import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const orderId = ref('');

onMounted(async () => {
  const sessionId = route.query.session_id;
  if (sessionId) {
    try {
      // Here you would typically fetch the order details from your backend
      // using the session ID
      orderId.value = sessionId;
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  }
});
</script>

<style scoped>
.v-card {
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style> 