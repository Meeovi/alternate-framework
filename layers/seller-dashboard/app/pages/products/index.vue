<template>
  <div>
    <h2>Products</h2>
    <button @click="refresh">Refresh</button>
    <ul>
      <li v-for="p in products" :key="p.id">{{ p.title || p.name || p.id }}</li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSellerProducts } from '~/layers/seller-dashboard/app/composables/useSellerProducts'

const products = ref([])
const { listProducts } = useSellerProducts()

async function refresh() {
  products.value = await listProducts()
}

onMounted(refresh)
</script>
