<template>
  <JsonFormRenderer
    :schema="schema"
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    @submit="emit('submit')"
    @reset="emit('reset')"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import JsonFormRenderer from '../../../../../../packages/modules/ui-forms/src/components/JsonFormRenderer.vue'

type ContentField = {
  field?: string
  type?: string
  name?: string
  schema?: {
    data_type?: string
    is_nullable?: boolean
  }
  meta?: {
    interface?: string
    note?: string
    hidden?: boolean
    required?: boolean
  }
}

const props = defineProps<{
  fields: ContentField[]
  modelValue: Record<string, unknown>
}>()

const emit = defineEmits<{
  'update:modelValue': [Record<string, unknown>]
  submit: []
  reset: []
}>()

function mapFieldType(field: ContentField) {
  const dataType = String(field.type || field.schema?.data_type || '').toLowerCase()
  const fieldInterface = String(field.meta?.interface || '').toLowerCase()

  if (fieldInterface.includes('datetime') || ['datetime', 'timestamp', 'date', 'time'].includes(dataType)) {
    return { type: 'string', format: 'date' }
  }

  if (fieldInterface.includes('file') || dataType === 'file') {
    return { type: 'string', format: 'file' }
  }

  if (fieldInterface.includes('rich-text') || dataType === 'text') {
    return { type: 'string', format: 'richtext' }
  }

  if (dataType === 'boolean') {
    return { type: 'boolean' }
  }

  if (['integer', 'bigint', 'float', 'decimal', 'number'].includes(dataType)) {
    return { type: 'number' }
  }

  return { type: 'string' }
}

const schema = computed(() => {
  const properties: Record<string, Record<string, unknown>> = {}
  const required: string[] = []

  for (const field of props.fields || []) {
    if (!field?.field || field?.meta?.hidden) continue

    properties[field.field] = {
      ...mapFieldType(field),
      title: field.meta?.note || field.name || field.field,
    }

    if (field.meta?.required || !field.schema?.is_nullable) {
      required.push(field.field)
    }
  }

  return {
    type: 'object',
    properties,
    required,
  }
})
</script>
