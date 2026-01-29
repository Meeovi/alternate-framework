<template>
  <nav class="pagination" v-if="totalPages > 1">
    <button :disabled="page <= 1" @click="$emit('change', page - 1)">Prev</button>
    <span>Page {{ page }} / {{ totalPages }}</span>
    <button :disabled="page >= totalPages" @click="$emit('change', page + 1)">Next</button>
  </nav>
</template>

<script setup lang="ts">
const props = defineProps({ page: { type: Number, required: true }, totalPages: { type: Number, required: true } })
const emits = defineEmits(['change'])
</script>

<style scoped>
.pagination { display:flex; gap:8px; align-items:center; }
.pagination button[disabled] { opacity: 0.5 }
</style>
