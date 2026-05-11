<template>
    <div>
      <v-btn color="primary" @click="redirectToCheckout">
        Proceed to Payment
      </v-btn>
    </div>
  </template>
  
  <script setup>
  import { getCommerceClient } from '../../utils/client';

  const nuxtApp = useNuxtApp();

  const redirectToCheckout = async () => {
    try {
      // Fetch the active order to get the order code or id
      const commerce = getCommerceClient();
      const orderRes = await (commerce?.getActiveOrder?.() || commerce?.activeOrder?.() || commerce?.getCart?.());
      const order = orderRes?.activeOrder || orderRes?.cart || orderRes || null;
      if (!order) return;

      // Attempt to create a checkout session in Data
      try {
        const payload = {
          orderCode: order.code,
          items: (order.lines || []).map((l) => ({ sku: l?.productVariant?.sku, quantity: l.quantity }))
        };
        const created = await nuxtApp.create('checkout_sessions', payload);
        // support common response shapes
        const redirectUrl = created?.redirect_url || created?.data?.redirect_url || created?.url || created?.data?.url;
        if (redirectUrl) {
          window.location.href = redirectUrl;
          return;
        }
      } catch (e) {
        console.warn('Data checkout session creation failed, falling back:', e);
      }

      // Fallback: redirect to local confirmation route
      window.location.href = `/checkout/confirmation/${order.code}`;
    } catch (error) {
      console.error('Checkout redirect failed:', error);
    }
  };
  </script>
