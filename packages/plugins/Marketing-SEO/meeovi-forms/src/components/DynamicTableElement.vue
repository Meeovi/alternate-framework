<template>
  <div class="table-wrapper">
    <v-data-table
      :headers="effectiveHeaders"
      :items="items"
      v-model:page="localPage"
      v-model:items-per-page="localItemsPerPage"
      v-model:sort-by="localSortBy"
      v-model:sort-desc="localSortDesc"
      :server-items-length="props.server ? props.totalItems : undefined"
      :loading="loading"
      :class="tableClass"
      show-select
      :item-key="itemKey"
      v-model:selected="selected"
    >
      <template #top>
        <slot name="top" />
      </template>

      <template #item="{ item }">
        <slot name="item" :item="item" :headers="effectiveHeaders">
          <tr>
            <td v-for="h in effectiveHeaders" :key="h.value">
              <template v-if="h.value === '__actions'">
                <slot name="actions" :item="item">
                  <!-- default actions: empty -->
                </slot>
              </template>
              <template v-else>
                <template v-if="props.formatDates && typeof item[h.value] === 'string' && isIsoDateString(item[h.value])">
                  {{ new Date(item[h.value]).toLocaleString() }}
                </template>
                <template v-else-if="typeof item[h.value] === 'boolean'">
                  <v-chip :color="item[h.value] ? 'primary' : 'grey'" size="small">{{ item[h.value] ? 'Yes' : 'No' }}</v-chip>
                </template>
                <template v-else-if="h.value === 'source'">
                  <v-chip :color="(item[h.value] === 'magento') ? 'success' : 'info'" size="small">{{ item[h.value] }}</v-chip>
                </template>
                <template v-else>
                  {{ formatCell(item[h.value], h.value) }}
                </template>
              </template>
            </td>
          </tr>
        </slot>
      </template>

      <template #no-data>
        <div class="pa-4 text-center">No data available</div>
      </template>
    </v-data-table>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = defineProps<{
  items?: any[]
  columns?: { text?: string; value: string }[]
  primaryKey?: string
  server?: boolean
  totalItems?: number
  page?: number
  itemsPerPage?: number
  loading?: boolean
  tableClass?: string
  formatDates?: boolean
  actions?: boolean
  sortBy?: string | string[]
  sortDesc?: boolean
}>()
const emit = defineEmits(['update:selected', 'update:page', 'update:itemsPerPage', 'update:sortBy', 'update:sortDesc', 'page-change', 'items-per-page-change', 'sort-change'])

const items = computed(() => props.items || [])
const localPage = ref(props.page ?? 1)
const localItemsPerPage = ref(props.itemsPerPage ?? 10)
const localSortBy = ref<any>(props.sortBy ?? null)
const localSortDesc = ref<any>(props.sortDesc ?? false)
const loading = computed(() => props.loading ?? false)
const tableClass = computed(() => props.tableClass ?? '')

const headers = computed(() => {
  if (props.columns && props.columns.length) {
    return props.columns.map((c) => ({ text: c.text ?? c.value, value: c.value }))
  }
  const first = items.value && items.value.length ? items.value[0] : null
  if (first) {
    return Object.keys(first).map((k) => ({ text: k.replace(/_/g, ' '), value: k }))
  }
  return []
})

const itemKey = computed(() => {
  const pk = props.primaryKey || 'id'
  if (items.value && items.value.length) {
    const first = items.value[0]
    if (pk in first) return pk
    if ('id' in first) return 'id'
    const keys = Object.keys(first)
    return keys.length ? keys[0] : 'id'
  }
  return pk
})

const effectiveHeaders = computed(() => {
  const h = headers.value.slice()
  if (props.actions) {
    h.push({ text: 'Actions', value: '__actions' })
  }
  return h
})

watch(() => props.page, (v) => { if (v !== undefined) localPage.value = v })
watch(() => props.itemsPerPage, (v) => { if (v !== undefined) localItemsPerPage.value = v })
watch(() => props.sortBy, (v) => { if (v !== undefined) localSortBy.value = v })
watch(() => props.sortDesc, (v) => { if (v !== undefined) localSortDesc.value = v })

watch(localPage, (v) => {
  emit('update:page', v)
  if (props.server) emit('page-change', v)
})
watch(localItemsPerPage, (v) => {
  emit('update:itemsPerPage', v)
  if (props.server) emit('items-per-page-change', v)
})
watch(localSortBy, (v) => {
  emit('update:sortBy', v)
  if (props.server) emit('sort-change', { sortBy: v, sortDesc: localSortDesc.value })
})
watch(localSortDesc, (v) => {
  emit('update:sortDesc', v)
  if (props.server) emit('sort-change', { sortBy: localSortBy.value, sortDesc: v })
})

const selected = ref<any[]>([])
watch(selected, (v) => emit('update:selected', v))

function isIsoDateString(val: string) {
  return typeof val === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(val)
}

function formatCell(value: any, field?: string) {
  if (value === null || value === undefined) return ''
  if (props.formatDates && typeof value === 'string' && isIsoDateString(value)) {
    try {
      return new Date(value).toLocaleString()
    } catch (e) {}
  }
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}
</script>

<style scoped>
.table-wrapper {
  width: 100%;
}
</style>
