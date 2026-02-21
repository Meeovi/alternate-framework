<template>
  <div>
    <h2>Shipments</h2>
    <UButton @click="refresh">Refresh</UButton>
    <ul>
      <li v-for="s in shipments" :key="s.id">Shipment #{{ s.id }} — {{ s.status }}</li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSellerShipments } from '~/layers/seller-dashboard/app/composables/useSellerShipments'

const shipments = ref([])
const { listShipments } = useSellerShipments()

async function refresh() {
  shipments.value = await listShipments()
}

onMounted(refresh)
</script>
