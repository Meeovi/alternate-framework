<template>
  <!-- Filters container: keep mounted and hide with v-show to preserve state easily
       or let parent unmount and rely on preserveSharedStateOnUnmount on ais-instant-search -->
  <aside v-show="visible" class="search-filters" :class="{ closed: !visible }">
    <!-- Current refinements + clear -->
    <ais-current-refinements :excluded-attributes="EXCLUDED_ATTRIBUTES"/>
    <ais-clear-refinements :excluded-attributes="EXCLUDED_ATTRIBUTES">
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

// A constant, not an inline array: a new array on a re-render makes the
// widget rebuild itself and search again (see resultsComponent.vue). The
// query isn't a filter to clear here; the header's search box owns it.
const EXCLUDED_ATTRIBUTES = ['query']

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

/* vue-instantsearch's default widgets render the label and hit-count as
   adjacent sibling spans with no gap between them (e.g. "Accessories" +
   "2" -> "Accessories2") — these were the only rule missing to visually
   separate them. */
:deep(.ais-RefinementList-labelText) {
  margin-right: 6px;
}

:deep(.ais-RefinementList-count),
:deep(.ais-RatingMenu-count) {
  padding: 1px 7px;
  border-radius: 10px;
  background: rgba(var(--v-theme-on-surface), 0.08);
  font-size: 0.75rem;
  font-weight: 600;
}

:deep(.ais-RatingMenu-label) {
  margin-right: 6px;
}

/* The app's search.css hides every SVG inside .ais-InstantSearch (to drop
   InstantSearch's own icons), stars included, so each option read "& Up"
   with nothing before it. */
/* Scoped under .search-filters and qualified with `svg` so it outranks
   that rule (0,3,1 against its 0,2,1). */
.search-filters :deep(svg.ais-RatingMenu-starIcon) {
  display: inline-block !important;
  width: 1em;
  height: 1em;
  fill: rgb(var(--v-theme-warning));
  vertical-align: -0.125em;
}

:deep(.ais-RatingMenu-starIcon--empty) {
  fill: rgba(var(--v-theme-on-surface), 0.25);
}

:deep(.ais-RatingMenu-link) {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}
</style>