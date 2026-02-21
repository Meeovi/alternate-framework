<template>
  <div>
    <h2>Orders</h2>
    <UButton @click="refresh">Refresh</UButton>
    <ul>
      <li v-for="o in orders" :key="o.id">Order #{{ o.id }} — {{ o.status }}</li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSellerOrders } from '~/layers/seller-dashboard/app/composables/useSellerOrders'

const orders = ref([])
const { listOrders } = useSellerOrders()

async function refresh() {
  orders.value = await listOrders()
}

onMounted(refresh)
</script>
