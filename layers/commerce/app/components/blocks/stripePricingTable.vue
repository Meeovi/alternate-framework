<template>
  <ClientOnly>
    <ScriptStripePricingTable
      :pricing-table-id="pricingTableId"
      :publishable-key="publishableKey"
    />
  </ClientOnly>
</template>

<script setup lang="ts">
import { usePayment } from '~/composables/payments/usePayment'

const { loadProvider } = usePayment()
const { public: publicConfig } = useRuntimeConfig()

const publishableKey = publicConfig.stripePublishableKey as string
const pricingTableId = publicConfig.stripePricingTableId as string

// Eagerly load the Stripe provider so the pricing table is ready
onMounted(async () => {
  await loadProvider()
})
</script>
