<template>
  <div>
    <h2>Spaces</h2>
    <button @click="refresh">Refresh</button>
    <ul>
      <li v-for="sp in spaces" :key="sp.id">{{ sp.name || sp.id }}</li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSellerSpaces } from '~/layers/seller-dashboard/app/composables/useSellerSpaces'

const spaces = ref([])
const { listSpaces } = useSellerSpaces()

async function refresh() {
  spaces.value = await listSpaces()
}

onMounted(refresh)
</script>
