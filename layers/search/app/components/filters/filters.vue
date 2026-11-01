<template>
  <!-- Filters container: keep mounted and hide with v-show to preserve state easily
       or let parent unmount and rely on preserveSharedStateOnUnmount on ais-instant-search -->
  <aside v-show="visible" class="search-filters" :class="{ closed: !visible }">
    <!-- The chosen filters, and "Clear all", are the chips above the
         results. -->
    <!-- `category`, `brand`, `resultType` (Products, Spaces, Bluesky
         posts, ...) and the `price` / `rating` numbers are worked out for
         every hit in layers/search/server/search/federate.ts. A list with
         nothing to offer for this search is hidden (ais-Panel--noRefinement
         below), as on any shop's results page. -->
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
      <ais-refinement-list attribute="resultType" :limit="8" />
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
// widget rebuild itself and search again (see resultsComponent.vue).
// start/end sit on the item itself: nested under `value` they were
// ignored, so every option meant "all prices" and the filter did nothing.
// Under $25 includes free.
const priceRanges = [
  { label: 'All prices' },
  { label: 'Free', start: 0, end: 0 },
  { label: 'Under $25', end: 25 },
  { label: '$25 to $50', start: 25, end: 50 },
  { label: '$50 to $100', start: 50, end: 100 },
  { label: '$100 & above', start: 100 },
]
</script>

<style scoped>
.search-filters { width: 280px; padding: 12px; border-right: 1px solid rgba(var(--v-theme-on-surface), 0.08); }
.search-filters.closed { display: none; }

/* Nothing to choose for this search (e.g. no brands, nothing rated yet). */
:deep(.ais-Panel--noRefinement) {
  display: none;
}

:deep(.ais-Panel) {
  margin-bottom: 16px;
}

:deep(.ais-Panel-header) {
  font-weight: 600;
  margin-bottom: 6px;
}

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