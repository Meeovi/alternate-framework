<template>
  <ClientOnly>
    <ais-instant-search :search-client="searchClient" index-name="products">
      <div class="shared-filters">
        <template v-for="widget in filterWidgets" :key="widget.name">
          <ais-panel v-if="widget.condition?.() ?? true">
            <template #header>{{ widget.panel?.header }}</template>
            <component
              :is="resolveWidgetComponent(widget)"
              v-bind="widget.props"
            />
          </ais-panel>
        </template>
      </div>
    </ais-instant-search>
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSearchClient } from '#shared/app/composables/search/useSearchClient'
import { useInstantSearchWidgets, resolveWidgetComponent, type InstantSearchWidgetConfig } from '#shared/app/composables/search/useInstantSearchWidgets'

const props = withDefaults(
  defineProps<{
    facets?: string[]
  }>(),
  {
    facets: () => ['category', 'brand', 'type', 'price'],
  }
)

const { searchClient } = useSearchClient()
const { widgetRegistry } = useInstantSearchWidgets()

const filterWidgets = computed<InstantSearchWidgetConfig[]>(() => {
  const widgets: InstantSearchWidgetConfig[] = []

  if (props.facets.includes('category')) {
    widgets.push({
      name: 'refinement-list',
      props: { attribute: 'category', limit: 20, searchable: true },
      panel: { header: 'Category' },
      condition: () => true,
    })
  }

  if (props.facets.includes('brand')) {
    widgets.push({
      name: 'refinement-list',
      props: { attribute: 'brand', limit: 20, searchable: true },
      panel: { header: 'Brand' },
      condition: () => true,
    })
  }

  if (props.facets.includes('type')) {
    widgets.push({
      name: 'refinement-list',
      props: { attribute: 'type', limit: 20 },
      panel: { header: 'Type' },
      condition: () => true,
    })
  }

  if (props.facets.includes('price')) {
    widgets.push({
      name: 'range-input',
      props: { attribute: 'price' },
      panel: { header: 'Price' },
      condition: () => true,
    })
  }

  return widgets
})
</script>

<style scoped>
.shared-filters {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.shared-filters :deep(.ais-Panel) {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 0.75rem;
}

.shared-filters :deep(.ais-Panel-header) {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.shared-filters :deep(.ais-RefinementList-list) {
  list-style: none;
  padding: 0;
  margin: 0;
}

.shared-filters :deep(.ais-RefinementList-item) {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0;
}

.shared-filters :deep(.ais-RefinementList-label) {
  cursor: pointer;
}

.shared-filters :deep(.ais-RangeInput-form) {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>
