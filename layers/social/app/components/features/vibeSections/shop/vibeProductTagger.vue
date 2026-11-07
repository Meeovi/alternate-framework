<template>
  <v-dialog :model-value="modelValue" max-width="640" scrollable @update:model-value="$emit('update:modelValue', $event)">
    <v-card>
      <v-card-title>Tag products in this {{ noun || 'vibe' }}</v-card-title>
      <v-card-subtitle class="text-wrap">
        Add any product on Meeovi. Give it a time and its card pops up over the video at that moment.
      </v-card-subtitle>

      <v-card-text>
        <v-autocomplete v-model="picked" v-model:search="query" :items="results" :loading="searching"
          item-title="name" return-object no-filter clearable hide-no-data density="comfortable"
          label="Search products" prepend-inner-icon="fas fa-magnifying-glass" :disabled="rows.length >= MAX">
          <template #item="{ props: itemProps, item }">
            <v-list-item v-bind="itemProps" :subtitle="(item.raw ?? item).seller_name || (item.raw ?? item).mageos_sku || ''" />
          </template>
        </v-autocomplete>
        <p v-if="rows.length >= MAX" class="text-caption mb-2">You can tag up to {{ MAX }} products.</p>

        <div v-for="(row, index) in rows" :key="row.key" class="vibe-tag-row">
          <div class="vibe-tag-row__name">{{ row.name }}</div>
          <v-text-field v-model="row.start" label="Show at" placeholder="0:15" density="compact" hide-details="auto"
            :error-messages="rowError(row, 'start')" class="vibe-tag-row__time" />
          <v-btn v-if="currentTime !== undefined" icon="fas fa-clock" size="small" variant="text"
            :title="`Use the video's current time (${formatSeconds(currentTime)})`"
            @click="row.start = formatSeconds(currentTime)" />
          <v-text-field v-model="row.end" label="Hide at" placeholder="optional" density="compact"
            hide-details="auto" :error-messages="rowError(row, 'end')" class="vibe-tag-row__time" :disabled="!row.start" />
          <v-btn icon="fas fa-trash" size="small" variant="text" :aria-label="`Remove ${row.name}`" @click="rows.splice(index, 1)" />
        </div>
        <p v-if="!rows.length" class="text-body-2 text-medium-emphasis mt-2">No products tagged yet.</p>
        <p class="text-caption text-medium-emphasis mt-3">
          Times are minutes:seconds. Without "Hide at", a card shows for {{ DEFAULT_PIN_SECONDS }} seconds;
          without "Show at", the product is only listed under the video.
        </p>
        <v-alert v-if="error" type="error" variant="tonal" density="compact" class="mt-2">{{ error }}</v-alert>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="$emit('update:modelValue', false)">Cancel</v-btn>
        <v-btn color="primary" :loading="saving" :disabled="hasErrors" @click="submit">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { productKey } from '#commerce/app/utils/productKey'
import { DEFAULT_PIN_SECONDS, formatSeconds, parseSeconds, type VibeProduct, type VibeTag } from '../../../../composables/vibez/useVibeProducts'

/**
 * The vibe creator's product tagging (shoppable vibez). Emits `save` with
 * the tags; the parent saves them (useVibeProducts().save) and reports back
 * through `error` / `saving`.
 */
const props = defineProps<{
  modelValue: boolean
  items: VibeProduct[]
  currentTime?: number
  saving?: boolean
  error?: string
  /** What's being tagged: 'vibe', or 'video' on a Video product's page. */
  noun?: string
}>()
const emit = defineEmits<{ 'update:modelValue': [open: boolean], save: [tags: VibeTag[]] }>()

const MAX = 20
type Row = { key: string, name: string, start: string, end: string }
const rows = ref<Row[]>([])

// Fresh rows from the saved list each time the dialog opens.
watch(() => props.modelValue, (open) => {
  if (!open) return
  rows.value = props.items.map((item) => ({
    key: productKey(item.product) || String(item.product.id),
    name: String(item.product.name ?? ''),
    start: formatSeconds(item.start),
    end: formatSeconds(item.end),
  }))
}, { immediate: true })

// Product search (Directus products through the CMS proxy).
const { $directus, $readItems } = useNuxtApp() as any
const query = ref('')
const results = ref<Record<string, any>[]>([])
const searching = ref(false)
const picked = ref<Record<string, any> | null>(null)
let timer: ReturnType<typeof setTimeout> | undefined
watch(query, (text) => {
  clearTimeout(timer)
  const q = String(text ?? '').trim()
  if (q.length < 2) { results.value = []; return }
  timer = setTimeout(async () => {
    searching.value = true
    try {
      const res = await $directus.request($readItems('products', {
        search: q,
        filter: { status: { _eq: 'published' } },
        fields: ['id', 'name', 'sku', 'mageos_sku', 'source', 'seller_name'],
        limit: 10,
      }))
      results.value = (res?.data ?? res ?? []) as Record<string, any>[]
    } catch {
      results.value = []
    } finally {
      searching.value = false
    }
  }, 300)
})
watch(picked, (product) => {
  if (!product) return
  const key = productKey(product) || String(product.id)
  if (!rows.value.some((row) => row.key === key) && rows.value.length < MAX) {
    rows.value.push({ key, name: String(product.name ?? ''), start: '', end: '' })
  }
  picked.value = null
  query.value = ''
})

function rowError(row: Row, field: 'start' | 'end'): string | undefined {
  const value = parseSeconds(row[field])
  if (Number.isNaN(value)) return 'Use m:ss'
  if (field === 'end' && value !== null) {
    const start = parseSeconds(row.start)
    if (start !== null && !Number.isNaN(start) && value <= start) return 'After "Show at"'
  }
  return undefined
}
const hasErrors = computed(() => rows.value.some((row) => rowError(row, 'start') || rowError(row, 'end')))

function submit() {
  emit('save', rows.value.map((row) => {
    const start = parseSeconds(row.start)
    return { product: row.key, start, end: start === null ? null : parseSeconds(row.end) }
  }))
}
</script>

<style scoped>
.vibe-tag-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.vibe-tag-row__name {
  flex: 1 1 200px;
  min-width: 0;
  font-weight: 600;
}

.vibe-tag-row__time {
  flex: 0 0 110px;
}
</style>
