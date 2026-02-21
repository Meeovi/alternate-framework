<template>
  <div>
    <h2>Shops</h2>
    <UButton @click="refresh">Refresh</UButton>
    <ul>
      <li v-for="s in shops" :key="s.id">{{ s.name || s.id }}</li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSellerShops } from '~/layers/seller-dashboard/app/composables/useSellerShops'

const shops = ref([])
const { listShops } = useSellerShops()

async function refresh() {
  shops.value = await listShops()
}

onMounted(refresh)
</script>
