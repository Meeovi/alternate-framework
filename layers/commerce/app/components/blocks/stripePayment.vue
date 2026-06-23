<template>
  <div ref="paymentEl" />
</template>

<script setup lang="ts">
const paymentEl = ref(null)
const { onLoaded } = useScriptStripe() as any
onMounted(() => {
  onLoaded(({ Stripe }: { Stripe: any }) => {
    const stripe = Stripe('YOUR_STRIPE_KEY')
    const elements = stripe.elements()
    const paymentElement = elements.create('payment', { /* pass keys */})
    paymentElement.mount(paymentEl.value)
  })
})
</script>