<template>
  <div>
    <h2>Shops</h2>
    <v-btn @click="refresh">Refresh</v-btn>
    <ul>
      <li v-for="s in shops" :key="s.id">{{ s.name || s.id }}</li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from '#imports'
import { useSellerShops } from '~/layers/seller-dashboard/app/composables/useSellerShops'

const shops = ref([])
const { listShops } = useSellerShops()

async function refresh() {
  shops.value = await listShops()
}

onMounted(refresh)
</script>
