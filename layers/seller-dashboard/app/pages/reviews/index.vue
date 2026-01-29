<template>
  <div>
    <h2>Reviews</h2>
    <button @click="refresh">Refresh</button>
    <ul>
      <li v-for="r in reviews" :key="r.id">{{ r.author || r.id }} — {{ r.rating || '' }} — {{ r.content || '' }}</li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSellerReviews } from '~/layers/seller-dashboard/app/composables/useSellerReviews'

const reviews = ref([])
const { listReviews } = useSellerReviews()

async function refresh() {
  reviews.value = await listReviews()
}

onMounted(refresh)
</script>
