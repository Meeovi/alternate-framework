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
// Plain $fetch here fetched twice — once during SSR, again on client
// hydration with no payload transfer between them — and could hydration-
// mismatch if the session's status changed in between. useFetch shares the
// SSR result with the client via the payload.
const route = useRoute()
const sessionId = route.query.session_id

const { data: response } = await useFetch(`/api/payment/stripe/checkout-session/${sessionId}`)
const status = computed(() => response.value?.data?.status)
</script>