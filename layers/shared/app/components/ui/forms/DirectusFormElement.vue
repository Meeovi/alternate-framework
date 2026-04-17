<template>
  <component
    :is="componentName"
    :field="fieldName"
    :label="fieldLabel"
    :required="required"
    :width="fieldWidth"
    :options="componentOptions"
    :collection="relationCollection"
    :multiple="relationMultiple"
    :model-value="modelValue"
    @update:model-value="onUpdate"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

type DirectusFieldSchema = {
  data_type?: string
  default_value?: unknown
  is_nullable?: boolean
  foreign_key_table?: string
}

type DirectusFieldMeta = {
  interface?: string
  note?: string
  width?: string
  hidden?: boolean
  required?: boolean
  options?: Record<string, unknown>
}

type DirectusField = {
  field?: string
  type?: string
  name?: string
  schema?: DirectusFieldSchema
  meta?: DirectusFieldMeta
}

const props = defineProps<{
  field: DirectusField
  modelValue?: unknown
}>()

const emit = defineEmits<{
  'update:modelValue': [value: unknown]
}>()

const fieldName = computed(() => String(props.field.field || 'value'))
const fieldLabel = computed(() => String(props.field.meta?.note || props.field.name || fieldName.value))
const fieldWidth = computed(() => props.field.meta?.width || null)
const required = computed(() => {
  if (typeof props.field.meta?.required === 'boolean') return props.field.meta.required
  return !Boolean(props.field.schema?.is_nullable)
})

const fieldInterface = computed(() => String(props.field.meta?.interface || '').toLowerCase())
const dataType = computed(() => String(props.field.type || props.field.schema?.data_type || '').toLowerCase())

const relationCollection = computed(() => props.field.schema?.foreign_key_table || '')
const relationMultiple = computed(() => fieldInterface.value.includes('many'))

const componentName = computed(() => {
  if (fieldInterface.value.includes('file') || fieldName.value === 'file' || fieldName.value.includes('image')) {
    return 'FileInput'
  }

  if (fieldInterface.value.includes('select-dropdown') || fieldInterface.value.includes('select-radio')) {
    return 'SelectInput'
  }

  if (fieldInterface.value.includes('select-multiple') || fieldInterface.value.includes('tags')) {
    return 'SelectInput'
  }

  if (fieldInterface.value.includes('m2o') || fieldInterface.value.includes('m2m') || relationCollection.value) {
    return 'RelationSelect'
  }

  if (fieldInterface.value.includes('input-rich-text') || dataType.value === 'text') {
    return 'TextArea'
  }

  if (dataType.value === 'boolean') {
    return 'BooleanInput'
  }

  if (['datetime', 'timestamp', 'date', 'time'].includes(dataType.value) || fieldInterface.value.includes('datetime')) {
    return 'DateTime'
  }

  if (dataType.value === 'json') {
    return 'TextArea'
  }

  return 'TextInput'
})

const componentOptions = computed(() => {
  const base = props.field.meta?.options || {}
  return {
    ...base,
    defaultValue: props.field.schema?.default_value,
  }
})

function onUpdate(value: unknown) {
  emit('update:modelValue', value)
}
</script>
