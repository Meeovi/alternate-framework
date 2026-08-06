<template>
  <div>
    <div v-if="status === 'complete'">
      <h1>Payment successful!</h1>
    </div>
    <div v-else-if="status === 'open'">
      <h1>Payment processing...</h1>
    </div>
    <div v-else>
      <h1>Something went wrong</h1>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const sessionId = route.query.session_id

const { data: session } = await $fetch(`/api/payment/stripe/checkout-session/${sessionId}`)
const status = session?.status
</script>