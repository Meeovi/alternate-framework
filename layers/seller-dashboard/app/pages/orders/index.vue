<template>
  <div>
    <h2>Orders</h2>
    <v-btn @click="refresh">Refresh</v-btn>
    <ul>
      <li v-for="o in orders" :key="o.id">Order #{{ o.id }} — {{ o.status }}</li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from '#imports'
import { useSellerOrders } from '~/layers/seller-dashboard/app/composables/useSellerOrders'

const orders = ref([])
const { listOrders } = useSellerOrders()

async function refresh() {
  orders.value = await listOrders()
}

onMounted(refresh)
</script>
