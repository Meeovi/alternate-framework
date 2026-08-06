<template>
  <ais-stats>
    <template #default="{ nbHits }">
      {{ formatter(nbHits) }}
    </template>
  </ais-stats>
</template>

<script setup lang="ts">
defineProps<{
  formatter: (nbHits: number) => string
}>()
</script>
