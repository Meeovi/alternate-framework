<script setup lang="ts">
import { computed, nextTick, provide, ref, watch } from 'vue'
import { Grid, HeaderMenu } from '@svar-ui/vue-grid'
import { Button, Locale, Pager, Select, Text } from '@svar-ui/vue-core'
import type { IColumnConfig } from '@svar-ui/vue-grid'
import '@svar-ui/vue-grid/all.css'
import '@svar-ui/vue-core/all.css'
import { useMeeoviTable } from '../composables/useMeeoviTable'
import { schemaToColumns } from '../utils/columns'
import MeeoviTableForm from './MeeoviTableForm.vue'

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
  /** SVAR locale words (e.g. from @svar-ui/core-locales); default English. */
  words?: Record<string, any>
  /** Dashboard size: title, count and `link` only — no search, source,
   *  edit actions or pager. */
  compact?: boolean
  /** "View all" link shown in compact mode. */
  link?: string
}>(), {
  height: '560px',
  toolbar: true,
  columns: () => [],
  hide: () => [],
})

const emit = defineEmits<{
  (e: 'select', row: Record<string, unknown>): void
  (e: 'saved', ev: { row: Record<string, unknown> | null, data: Record<string, unknown> }): void
  (e: 'deleted', row: Record<string, unknown>): void
}>()

const table = useMeeoviTable(() => props.collection, {
  source: () => props.source,
  pageSize: props.pageSize,
  sort: props.sort,
})
const { rows, schema, total, sources, activeSource, label, pending, error, page, pageSize, sort, search, source, canEdit, primaryKey, notice, apiBase } = table

const api = ref()
const columns = computed(() => schemaToColumns(schema.value, props.columns, props.hide))
const sortMarks = computed(() => {
  if (!sort.value) return {}
  const desc = sort.value.startsWith('-')
  return { [desc ? sort.value.slice(1) : sort.value]: { order: desc ? 'desc' : 'asc' } }
})
// The grid resets its sort marks whenever it receives new data — i.e. after
// every server-side sort — so re-apply them once the new rows are in. This
// only sets display state; the rows already arrive sorted.
watch([rows, sortMarks], async () => {
  await nextTick()
  api.value?.getStores?.()?.data?.setState?.({ sortMarks: sortMarks.value })
}, { flush: 'post' })

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
  // Through the API: the :onselectrow prop callback doesn't fire here.
  grid.on('select-row', onSelectRow)
  // Double-click opens our form (validated, saved through the API) rather
  // than SVAR's inline cell editor.
  grid.intercept('open-editor', (ev: { id: string | number }) => {
    const row = findRow(ev.id)
    if (canEdit.value && row) openEdit(row)
    return false
  })
}

function findRow(id: string | number) {
  return rows.value.find((r) => String(r[primaryKey.value] ?? r.id) === String(id))
}

const selectedRow = ref<Record<string, unknown> | null>(null)
watch(rows, () => { selectedRow.value = null })

function onSelectRow(ev: { id: string | number }) {
  const row = findRow(ev.id)
  selectedRow.value = row ?? null
  if (row) emit('select', row)
}

// ---- create / edit / delete (canEdit: editRoles + a writable source) ----
const formOpen = ref(false)
const formRow = ref<Record<string, unknown> | null>(null)
const saving = ref(false)
const formError = ref<string | null>(null)
const actionError = ref<string | null>(null)

// People see plain messages; only validation errors (400 / 422 — e.g. a
// missing required field) pass the server's wording through.
function errorText(e: any, fallback: string) {
  const status = e?.statusCode ?? e?.status ?? e?.response?.status
  if (status === 401) return 'Please sign in again.'
  if (status === 403) return "You don't have permission to do that."
  if (status === 400 || status === 422) return e?.data?.statusMessage || e?.statusMessage || fallback
  return fallback
}

function rowUrl(row?: Record<string, unknown> | null) {
  const base = `${apiBase}/${encodeURIComponent(props.collection)}`
  return row ? `${base}/${encodeURIComponent(String(row[primaryKey.value]))}` : base
}

function openAdd() {
  formRow.value = null
  formError.value = null
  formOpen.value = true
}

function openEdit(row: Record<string, unknown>) {
  formRow.value = row
  formError.value = null
  formOpen.value = true
}

function closeForm() {
  formOpen.value = false
}

async function save(data: Record<string, unknown>) {
  if (!formRow.value && !Object.keys(data).length) return
  if (formRow.value && !Object.keys(data).length) { closeForm(); return }
  saving.value = true
  formError.value = null
  try {
    await $fetch(rowUrl(formRow.value), {
      method: formRow.value ? 'PATCH' : 'POST',
      query: { source: activeSource.value || undefined },
      body: data,
    })
    closeForm()
    emit('saved', { row: formRow.value, data })
    await table.refresh()
  } catch (e: any) {
    formError.value = errorText(e, "Couldn't save. Please try again.")
  } finally {
    saving.value = false
  }
}

async function removeSelected() {
  const row = selectedRow.value
  if (!row) return
  const name = String(row.name ?? row.title ?? row[primaryKey.value])
  if (typeof window !== 'undefined' && !window.confirm(`Delete "${name}"? This can't be undone.`)) return
  actionError.value = null
  try {
    await $fetch(rowUrl(row), { method: 'DELETE', query: { source: activeSource.value || undefined } })
    emit('deleted', row)
    await table.refresh()
  } catch (e: any) {
    actionError.value = errorText(e, "Couldn't delete. Please try again.")
  }
}

// Explicit handlers: the refs are destructured from useMeeoviTable(), and
// template assignments / v-model to such bindings don't reach `.value`.
function onSource(ev: { value: string | number }) {
  source.value = String(ev.value)
}

// Pager: its `value` model is the page, its `pageSize` model the rows per
// page (its onchange reports either as `value`, so it isn't used).
function onPage(value: number) {
  page.value = Number(value) || 1
}

function onPageSize(value: number) {
  const size = Math.trunc(Number(value))
  if (size > 0) pageSize.value = size
}

// Willow theme without SVAR's <Willow> component: that component always
// renders a <Teleport to="head"> (for its fonts, even with fonts off), and
// Nuxt's SSR doesn't render head teleports in place — a hydration mismatch
// on every page. What the theme does is just this context + the
// `wx-theme wx-willow-theme` wrapper class (template), which SVAR's CSS
// variables hang off. The fonts it would inject come from useHead below,
// rendered identically on server and client; wx-icons supplies the
// search / pager / sort-mark icons.
provide('wx-theme', 'willow')

useHead({
  link: [
    { rel: 'preconnect', href: 'https://cdn.svar.dev', crossorigin: '' },
    { rel: 'stylesheet', href: 'https://cdn.svar.dev/fonts/wxi/wx-icons.css', key: 'svar-wx-icons' },
  ],
  style: [{
    key: 'svar-open-sans',
    textContent: [400, 500, 600, 700].map((w) => {
      const file = w === 400 ? 'regular' : w
      return `@font-face{font-family:'Open Sans';font-style:normal;font-weight:${w};src:local(''),url('https://cdn.svar.dev/fonts/open-sans/${file}.woff2') format('woff2'),url('https://cdn.svar.dev/fonts/open-sans/${file}.woff') format('woff')}`
    }).join(''),
  }],
})

const loadErrorText = computed(() => {
  const status = (error.value as any)?.statusCode
  if (status === 401) return `Please sign in to see ${label.value.toLowerCase()}.`
  if (status === 403) return `You don't have access to ${label.value.toLowerCase()}.`
  return `${label.value} couldn't be loaded right now. Please try again later.`
})
const emptyText = computed(() => {
  const name = label.value.toLowerCase()
  if (search.value.trim()) return `No ${name} match "${search.value.trim()}".`
  return canEdit.value
    ? `There are no ${name} yet. Use Add to create the first one.`
    : `There are no ${name} yet. They'll show up here once there are some.`
})
// The table always shows; anything that leaves it without rows (nothing
// there yet, a source that isn't available, a failed load) is explained
// inside it rather than replacing it.
const overlayText = computed(() => {
  if (error.value) return loadErrorText.value
  if (notice.value) return notice.value
  if (pending.value || rows.value.length) return undefined
  return emptyText.value
})
// No schema (e.g. the source isn't available) still draws the table.
const gridColumns = computed(() => columns.value.length
  ? columns.value
  : [{ id: '__empty', header: label.value, flexgrow: 1, sort: false }])

defineExpose({ refresh: table.refresh, api })
</script>

<template>
  <!-- Locale provides the `wx-i18n` context the core controls (Pager, Select,
       Text) need outside the Grid; it renders no DOM of its own. -->
  <Locale :words="words">
  <div class="wx-theme wx-willow-theme">
    <div class="meeovi-table" :style="{ height }">
      <div v-if="toolbar" class="meeovi-table__bar">
        <strong class="meeovi-table__title">{{ label }}</strong>
        <span class="meeovi-table__count">{{ total.toLocaleString() }} {{ total === 1 ? 'item' : 'items' }}</span>
        <div class="meeovi-table__spacer" />
        <NuxtLink v-if="compact && link" :to="link" class="meeovi-table__link">View all</NuxtLink>
        <template v-if="!compact">
        <div v-if="sourceOptions.length > 1" class="meeovi-table__source">
          <Select :options="sourceOptions" :value="activeSource" :onchange="onSource" />
        </div>
        <div class="meeovi-table__search">
          <Text v-model:value="searchInput" placeholder="Search…" icon="wxi-search" css="wx-icon-left" clear />
        </div>
        <div v-if="canEdit" class="meeovi-table__actions">
          <Button type="primary" icon="wxi-plus" :onclick="openAdd">Add</Button>
          <Button icon="wxi-edit" :disabled="!selectedRow" :onclick="() => selectedRow && openEdit(selectedRow)">Edit</Button>
          <Button type="danger" icon="wxi-delete" :disabled="!selectedRow" :onclick="removeSelected">Delete</Button>
        </div>
        </template>
      </div>

      <div v-if="actionError" class="meeovi-table__message meeovi-table__message--error">{{ actionError }}</div>

      <div class="meeovi-table__grid" :class="{ 'meeovi-table__grid--loading': pending }">
        <HeaderMenu :api="api">
          <Grid
            ref="api"
            :data="rows"
            :columns="gridColumns"
            :init="init"
            :overlay="overlayText"
          />
        </HeaderMenu>
      </div>

      <div v-if="!compact" class="meeovi-table__pager">
        <Pager :total="total" :value="page" :page-size="pageSize" @update:value="onPage" @update:page-size="onPageSize" />
      </div>
    </div>

    <MeeoviTableForm
      v-if="formOpen"
      :schema="schema"
      :row="formRow"
      :title="formRow ? `Edit ${label}` : `Add to ${label}`"
      :saving="saving"
      :error="formError"
      @save="save"
      @close="closeForm"
    />
  </div>
  </Locale>
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

.meeovi-table__link {
  font-size: 0.85rem;
  text-decoration: none;
  color: rgb(var(--v-theme-primary, 30, 136, 229));
}

.meeovi-table__actions {
  display: flex;
  gap: 8px;
}

.meeovi-table__pager {
  display: flex;
  justify-content: flex-end;
}
</style>
