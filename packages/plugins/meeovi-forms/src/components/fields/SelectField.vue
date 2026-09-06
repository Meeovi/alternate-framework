<template>
  <v-select
    :model-value="modelValue ?? (multiple ? [] : null)"
    :items="items"
    item-title="title"
    item-value="value"
    :label="label"
    :multiple="multiple"
    variant="outlined"
    density="comfortable"
    hide-details="auto"
    class="field"
    @update:model-value="onChange"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface SelectFieldProps {
  label: string
  modelValue: string | number | string[] | null
  /** Directus passes `meta.options` here, e.g. `{ choices: [{ text, value }] }`. */
  options?: unknown[] | { choices?: unknown[] }
  multiple?: boolean
  schema?: Record<string, any>
}

const props = defineProps<SelectFieldProps>()
const emit = defineEmits<{ 'update:modelValue': [value: string | number | string[] | null] }>()

// Directus stores select choices in `meta.options.choices` (`{ text, value }`),
// falling back to a plain options array or a JSON-schema `enum`.
const selectOptions = computed(() => {
  const src = props.options || props.schema?.enum
  if (Array.isArray(src)) return src as any[]
  if (src && Array.isArray((src as any).choices)) return (src as any).choices as any[]
  return [] as any[]
})

// v-select reads `title`/`value` by default — normalize whatever shape the
// source options came in (Directus `{text, value}`, plain strings, etc.)
// into that.
const items = computed(() =>
  selectOptions.value.map((option: any) => ({
    title: String(option?.text ?? option?.label ?? option),
    value: option?.value ?? option,
  }))
)

const onChange = (value: string | number | string[] | null) =>
  emit('update:modelValue', value ?? (props.multiple ? [] : null))
</script>
