<template>
    <div>
      <v-btn color="primary" @click="redirectToCheckout">
        Proceed to Payment
      </v-btn>
    </div>
  </template>
  
  <script setup>
  import getActiveOrderQuery from '#graphql/app/commerce/queries/activeOrder.gql';

  const nuxtApp = useNuxtApp();

  const redirectToCheckout = async () => {
    try {
      // Fetch the active order to get the order code or id
      const orderRes = await nuxtApp.$graphql.request(getActiveOrderQuery);
      const order = orderRes?.activeOrder;
      if (!order) return;

      // Attempt to create a checkout session in Directus
      try {
        const payload = {
          orderCode: order.code,
          items: (order.lines || []).map((l) => ({ sku: l?.productVariant?.sku, quantity: l.quantity }))
        };
        const created = await nuxtApp.$createItem('checkout_sessions', payload);
        // support common response shapes
        const redirectUrl = created?.redirect_url || created?.data?.redirect_url || created?.url || created?.data?.url;
        if (redirectUrl) {
          window.location.href = redirectUrl;
          return;
        }
      } catch (e) {
        console.warn('Directus checkout session creation failed, falling back:', e);
      }

      // Fallback: redirect to local confirmation route
      window.location.href = `/checkout/confirmation/${order.code}`;
    } catch (error) {
      console.error('Checkout redirect failed:', error);
    }
  };
  </script>
