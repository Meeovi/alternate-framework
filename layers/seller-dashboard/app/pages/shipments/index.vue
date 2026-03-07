<template>
  <div>
    <h2>Shipments</h2>
    <v-btn @click="refresh">Refresh</v-btn>
    <ul>
      <li v-for="s in shipments" :key="s.id">Shipment #{{ s.id }} — {{ s.status }}</li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from '#imports'
import { useSellerShipments } from '~/layers/seller-dashboard/app/composables/useSellerShipments'

const shipments = ref([])
const { listShipments } = useSellerShipments()

async function refresh() {
  shipments.value = await listShipments()
}

onMounted(refresh)
</script>
