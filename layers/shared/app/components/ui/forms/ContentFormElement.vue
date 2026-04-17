<template>
  <DirectusFormElement :field="field" :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" />
</template>

<script setup lang="ts">
import DirectusFormElement from './DirectusFormElement.vue'

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

defineProps<{
  field: DirectusField
  modelValue?: unknown
}>()

const emit = defineEmits<{
  'update:modelValue': [value: unknown]
}>()

defineOptions({
  inheritAttrs: false,
})
</script>
