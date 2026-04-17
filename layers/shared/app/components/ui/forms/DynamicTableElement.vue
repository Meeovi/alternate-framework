<script setup lang="ts">
import { onMounted, ref } from 'vue'
import useContent from '../../../composables/useContent'

type DirectusField = {
  field: string
  meta?: {
    hidden?: boolean
    note?: string
  }
}

type TableColumn = {
  key: string
  label: string
}

const props = defineProps<{
  collection: string
}>()

const { readFieldsByCollection, readItems } = useContent()

const loading = ref(true)
const rows = ref<Record<string, unknown>[]>([])
const columns = ref<TableColumn[]>([])

onMounted(async () => {
  loading.value = true
  try {
    const fields = await readFieldsByCollection(props.collection)
    const normalizedFields = (Array.isArray(fields) ? fields : []) as DirectusField[]

    columns.value = normalizedFields
      .filter((field) => !field.meta?.hidden)
      .map((field) => ({
        key: field.field,
        label: String(field.meta?.note || field.field),
      }))

    const result = await readItems(props.collection)
    rows.value = Array.isArray(result) ? (result as Record<string, unknown>[]) : []
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div v-if="loading">Loading table...</div>

  <table v-else class="auto-table">
    <thead>
      <tr>
        <th v-for="col in columns" :key="col.key">
          {{ col.label }}
        </th>
      </tr>
    </thead>

    <tbody>
      <tr v-for="(row, idx) in rows" :key="String(row.id || idx)">
        <td v-for="col in columns" :key="col.key">
          {{ row[col.key] }}
        </td>
      </tr>
    </tbody>
  </table>
</template>
