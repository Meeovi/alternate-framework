<!-- TEMP-TABLES test page -->
<template>
  <div>
    <h1 class="text-h3 mb-4">meeovi-tables test</h1>
    <MeeoviTable collection="products" height="520px" @select="(row) => (selected = row)" />
    <pre v-if="selected" class="mt-2">selected: {{ selected.name }}</pre>
  </div>
</template>

<script setup lang="ts">
const selected = ref<Record<string, any> | null>(null)
</script>
