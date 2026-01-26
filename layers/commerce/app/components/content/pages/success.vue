<template>
  <v-container class="text-center">
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card class="pa-6">
          <v-icon color="success" size="64" class="mb-4">mdi-check-circle</v-icon>
          <h1 class="text-h4 mb-4">Thank You for Your Purchase!</h1>
          <p class="text-body-1 mb-4">
            Your order has been successfully placed. We've sent a confirmation email to your registered email address.
          </p>
          <p class="text-body-1 mb-6">
            Order ID: {{ orderId }}
          </p>
          <v-btn
            color="primary"
            @click="router.push('/')"
            class="mr-4"
          >
            Continue Shopping
          </v-btn>
          <v-btn
            color="secondary"
            @click="router.push('/orders')"
          >
            View Orders
          </v-btn>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
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