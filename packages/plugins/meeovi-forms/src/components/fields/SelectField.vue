<template>
  <label class="field">
    <span>{{ label }}</span>
    <select :value="modelValue ?? ''" @change="onChange" :multiple="multiple">
      <option
        v-for="option in selectOptions"
        :key="String(option.value ?? option)"
        :value="String(option.value ?? option)"
      >
        {{ option.text ?? option.label ?? option }}
      </option>
    </select>
  </label>
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

const onChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  if (target.multiple) {
    emit('update:modelValue', Array.from(target.selectedOptions).map((o) => o.value))
  } else {
    emit('update:modelValue', target.value || null)
  }
}
</script>

<style scoped>
.field { display: grid; gap: 0.35rem; }
</style>
