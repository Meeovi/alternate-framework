<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Grid, HeaderMenu, Willow } from '@svar-ui/vue-grid'
import { Pager, Select, Text } from '@svar-ui/vue-core'
import type { IColumnConfig } from '@svar-ui/vue-grid'
import '@svar-ui/vue-grid/all.css'
import '@svar-ui/vue-core/all.css'
import { useMeeoviTable } from '../composables/useMeeoviTable'
import { schemaToColumns } from '../utils/columns'

/**
 * Dynamic table for any allowlisted collection: rows come from the installed
 * adapter-* that serves it (adapter-magento, ...) or Directus, columns from
 * the collection's Directus schema. Paging, sorting and search run on the
 * server.
 */
const props = withDefaults(defineProps<{
  collection: string
  /** Force a source ('directus', 'magento', ...). */
  source?: string
  pageSize?: number
  /** Initial sort: 'field' or '-field'. */
  sort?: string
  height?: string
  /** Column tweaks merged by id (width, header, template, hidden, ...). */
  columns?: Partial<IColumnConfig>[]
  /** Columns that start hidden (still available in the header menu). */
  hide?: string[]
  /** Show the title / search / source bar. */
  toolbar?: boolean
}>(), {
  height: '560px',
  toolbar: true,
  columns: () => [],
  hide: () => [],
})

const emit = defineEmits<{ (e: 'select', row: Record<string, unknown>): void }>()

const table = useMeeoviTable(() => props.collection, {
  source: () => props.source,
  pageSize: props.pageSize,
  sort: props.sort,
})
const { rows, schema, total, sources, activeSource, label, pending, error, page, pageSize, sort, search, source } = table

const api = ref()
const columns = computed(() => schemaToColumns(schema.value, props.columns, props.hide))
const sortMarks = computed(() => {
  if (!sort.value) return {}
  const desc = sort.value.startsWith('-')
  return { [desc ? sort.value.slice(1) : sort.value]: { order: desc ? 'desc' : 'asc' } }
})
const sourceOptions = computed(() => sources.value.map((s) => ({ id: s.id, label: s.label })))

// Search box → server search, debounced.
const searchInput = ref('')
let timer: ReturnType<typeof setTimeout> | undefined
watch(searchInput, (value) => {
  clearTimeout(timer)
  timer = setTimeout(() => { search.value = String(value ?? '') }, 350)
})

function init(grid: any) {
  // Sort on the server instead of re-ordering just the current page.
  grid.intercept('sort-rows', (ev: { key: string, order?: 'asc' | 'desc' }) => {
    const current = sort.value?.replace(/^-/, '')
    const currentDesc = sort.value?.startsWith('-')
    const order = ev.order ?? (current === ev.key && !currentDesc ? 'desc' : 'asc')
    sort.value = order === 'desc' ? `-${ev.key}` : ev.key
    return false
  })
}

function onSelectRow(ev: { id: string | number }) {
  const row = rows.value.find((r) => String(r.id) === String(ev.id))
  if (row) emit('select', row)
}

function onPage(ev: { value: number }) {
  page.value = ev.value
}

defineExpose({ refresh: table.refresh, api })
</script>

<template>
  <Willow>
    <div class="meeovi-table" :style="{ height }">
      <div v-if="toolbar" class="meeovi-table__bar">
        <strong class="meeovi-table__title">{{ label }}</strong>
        <span class="meeovi-table__count">{{ total.toLocaleString() }} rows</span>
        <div class="meeovi-table__spacer" />
        <div v-if="sourceOptions.length > 1" class="meeovi-table__source">
          <Select :options="sourceOptions" :value="activeSource" :onchange="(ev: any) => (source = String(ev.value))" />
        </div>
        <div class="meeovi-table__search">
          <Text v-model:value="searchInput" placeholder="Search…" icon="wxi-search" css="wx-icon-left" clear />
        </div>
      </div>

      <div v-if="error" class="meeovi-table__message meeovi-table__message--error">
        {{ (error as any)?.data?.statusMessage || (error as any)?.statusMessage || 'This table could not be loaded.' }}
      </div>

      <div v-else class="meeovi-table__grid" :class="{ 'meeovi-table__grid--loading': pending }">
        <HeaderMenu :api="api">
          <Grid
            ref="api"
            :data="rows"
            :columns="columns"
            :sort-marks="sortMarks"
            :init="init"
            :onselectrow="onSelectRow"
            :overlay="!pending && !rows.length ? 'No rows' : undefined"
          />
        </HeaderMenu>
      </div>

      <div class="meeovi-table__pager">
        <Pager :total="total" :value="page" v-model:page-size="pageSize" :onchange="onPage" />
      </div>
    </div>
  </Willow>
</template>

<style>
.meeovi-table {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
}

.meeovi-table__bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.meeovi-table__title {
  font-size: 1rem;
}

.meeovi-table__count {
  opacity: 0.65;
  font-size: 0.85rem;
}

.meeovi-table__spacer {
  flex: 1;
}

.meeovi-table__source {
  width: 160px;
}

.meeovi-table__search {
  width: min(280px, 100%);
}

.meeovi-table__grid {
  flex: 1;
  min-height: 0;
  transition: opacity 0.15s;
}

.meeovi-table__grid--loading {
  opacity: 0.55;
}

.meeovi-table__message {
  padding: 12px;
  border-radius: 6px;
}

.meeovi-table__message--error {
  background: #fdecea;
  color: #8a1c13;
}

.meeovi-table__pager {
  display: flex;
  justify-content: flex-end;
}
</style>
