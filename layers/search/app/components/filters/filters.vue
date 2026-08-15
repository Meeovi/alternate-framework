<template>
  <!-- Filters container: keep mounted and hide with v-show to preserve state easily
       or let parent unmount and rely on preserveSharedStateOnUnmount on ais-instant-search -->
  <aside v-show="visible" class="search-filters" :class="{ closed: !visible }">
    <!-- Current refinements + clear -->
    <ais-current-refinements :excluded-attributes="[]"/>
    <ais-clear-refinements :excluded-attributes="[]">
      <template #resetLabel>Clear all</template>
    </ais-clear-refinements>

    <!-- These map 1:1 onto the flat `category` / `brand` / `type` term
         aggregations and the `price` / `rating` numeric fields produced by
         layers/search/server/api/search.ts. Dynamic widgets aren't used
         here because the OpenSearch-backed index has no hierarchical
         (categories.lvlN) fields to introspect. -->
    <ais-panel>
      <template #header>Category</template>
      <ais-refinement-list attribute="category" :limit="10" searchable searchable-placeholder="Find categories" />
    </ais-panel>

    <ais-panel>
      <template #header>Brand</template>
      <ais-refinement-list attribute="brand" :limit="8" searchable searchable-placeholder="Find brands" />
    </ais-panel>

    <ais-panel v-if="showTypeFilter">
      <template #header>Type</template>
      <ais-refinement-list attribute="type" :limit="8" />
    </ais-panel>

    <ais-panel>
      <template #header>Rating</template>
      <ais-rating-menu attribute="rating" :max="5" />
    </ais-panel>

    <ais-panel>
      <template #header>Price</template>
      <ais-numeric-menu attribute="price" :items="priceRanges" />
    </ais-panel>
  </aside>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  visible?: boolean
  showTypeFilter?: boolean
}>(), {
  visible: true,
  showTypeFilter: true,
})

const priceRanges = [
  { label: 'All prices', value: {} },
  { label: 'Under $25', value: { end: 25 } },
  { label: '$25 to $50', value: { start: 25, end: 50 } },
  { label: '$50 to $100', value: { start: 50, end: 100 } },
  { label: '$100 & above', value: { start: 100 } },
]
</script>

<style scoped>
.search-filters { width: 280px; padding: 12px; border-right: 1px solid #eee; }
.search-filters.closed { display: none; }
</style>