<template>
  <div class="comments-placeholder">
    <p v-if="productName"><strong>Comments for:</strong> {{ productName }}</p>
    <slot />
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  productName: { type: String, required: false },
  productImage: { type: String, required: false },
  productSku: { type: [String, Number], required: false },
  comments: { type: Array, required: false }
})
</script>
