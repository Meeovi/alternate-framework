<template>
  <ais-pagination v-slot="{ currentRefinement, nbPages, refine }">
    <v-pagination
      v-if="nbPages > 1"
      :model-value="currentRefinement + 1"
      :length="nbPages"
      :total-visible="7"
      rounded="circle"
      @update:model-value="refine($event - 1)"
    />
  </ais-pagination>
</template>

<script setup lang="ts">
</script>
