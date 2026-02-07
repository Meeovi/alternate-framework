<template>
  <div class="pagination">
    <button :disabled="page <= 1" @click="change(page - 1)">Prev</button>
    <span class="page-info">Page {{ page }} / {{ totalPages }}</span>
    <button :disabled="page >= totalPages" @click="change(page + 1)">Next</button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({ page: { type: Number, default: 1 }, totalPages: { type: Number, default: 1 } })
const emit = defineEmits(['change'])

function change(p: number) {
  emit('change', p)
}
</script>

<style scoped>
.pagination { display:flex; gap:12px; align-items:center }
.page-info { font-weight:600 }
</style>
