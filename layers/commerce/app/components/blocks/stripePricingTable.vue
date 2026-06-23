<template>
  <ScriptStripePricingTable
    pricing-table-id="prctbl_1PD0MMEclFNgdHcR8t0Jop2H"
    publishable-key="pk_live_51OhXSKEclFNgdHcRNi5xBjBClxsA0alYgt6NzBwUZ880pLG88rYSCYPQqpzM3TedzNYu5g2AynKiPI5QVLYSorLJ002iD4VZIB"
  />
</template>

<script setup lang="ts">
import { useScriptStripe } from '#imports'

const { onLoaded } = useScriptStripe()

onLoaded((api: any) => {
  console.log('Stripe API loaded:', api)
})
</script>