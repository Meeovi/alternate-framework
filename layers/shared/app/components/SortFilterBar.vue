<template>
  <!-- Search, sort and filters for a list (see composables/useSortFilter.ts). -->
  <div class="sortFilterBar" role="search" :aria-label="label">
    <v-text-field v-if="controller.config.search" :model-value="controller.q.value" :label="searchLabel"
      prepend-inner-icon="fas fa-magnifying-glass" density="compact" variant="outlined" hide-details clearable
      class="sortFilterBar__search" @update:model-value="controller.setSearch($event ?? '')" />

    <v-select v-if="controller.config.sorts.length > 1" :model-value="controller.sort.value"
      :items="controller.config.sorts" item-title="title" item-value="value" label="Sort by" density="compact"
      variant="outlined" hide-details class="sortFilterBar__field" @update:model-value="controller.setSort($event)" />

    <v-select v-for="filter in shownFilters" :key="filter.key" :model-value="chosen(filter)"
      :items="filter.choices" item-title="title" item-value="value" :label="filter.title" :multiple="filter.multiple"
      :chips="filter.multiple" closable-chips clearable density="compact" variant="outlined" hide-details
      class="sortFilterBar__field" @update:model-value="choose(filter, $event)" />

    <div class="sortFilterBar__end">
      <span v-if="count !== undefined" class="sortFilterBar__count" aria-live="polite">
        {{ countText }}
      </span>
      <v-btn v-if="controller.active.value" variant="text" size="small" prepend-icon="fas fa-xmark"
        @click="controller.reset()">
        Clear
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FilterDef, SortFilter } from '../composables/useSortFilter'

const props = withDefaults(defineProps<{
  controller: SortFilter<any>
  /** How many items are shown, for "12 of 40". */
  count?: number
  total?: number
  /** What the items are, for the count ("products", "notes"). */
  noun?: string
  searchLabel?: string
  label?: string
}>(), {
  noun: 'items',
  searchLabel: 'Search',
  label: 'Sort and filter',
})

// A filter with fewer than two choices can't narrow anything: hidden,
// unless something is already chosen in it (so it can be cleared).
const shownFilters = computed(() => (props.controller.config.filters ?? [])
  .map((filter) => ({
    ...filter,
    choices: typeof filter.options === 'function' ? filter.options() : filter.options,
  }))
  .filter((filter) => filter.choices.length > 1 || (props.controller.filters.value[filter.key] ?? []).length))

const chosen = (filter: FilterDef<any>) => {
  const values = props.controller.filters.value[filter.key] ?? []
  return filter.multiple ? values : (values[0] ?? null)
}
const choose = (filter: FilterDef<any>, value: string | string[] | null) =>
  props.controller.setFilter(filter.key, Array.isArray(value) ? value : value ? [value] : [])

const countText = computed(() => {
  const shown = props.count ?? 0
  return props.total !== undefined && props.total !== shown
    ? `${shown} of ${props.total} ${props.noun}`
    : `${shown} ${props.noun}`
})
</script>

<style scoped>
.sortFilterBar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
  padding: 12px 16px;
}

.sortFilterBar__search {
  flex: 2 1 220px;
  max-width: 420px;
}

.sortFilterBar__field {
  flex: 1 1 160px;
  max-width: 240px;
}

.sortFilterBar__end {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.sortFilterBar__count {
  font-size: 0.875rem;
  opacity: 0.75;
  white-space: nowrap;
}

@media (max-width: 600px) {
  .sortFilterBar__search,
  .sortFilterBar__field {
    max-width: none;
    flex-basis: 100%;
  }
}
</style>
