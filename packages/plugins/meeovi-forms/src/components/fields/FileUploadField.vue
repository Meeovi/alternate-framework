<template>
  <v-file-input
    :model-value="internalValue"
    :label="label"
    variant="outlined"
    density="comfortable"
    hide-details="auto"
    class="field"
    @update:model-value="onChange"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface FileUploadFieldProps {
  label: string
  modelValue?: File | null
  schema?: Record<string, any>
}

const props = defineProps<FileUploadFieldProps>()
const emit = defineEmits<{ 'update:modelValue': [value: File | null] }>()

// v-file-input always models an array, even without `multiple` — this
// field's own contract is a single File | null.
const internalValue = computed(() => (props.modelValue ? [props.modelValue] : []))

const onChange = (files: File[] | File | null) => {
  const value = Array.isArray(files) ? (files[0] ?? null) : files
  emit('update:modelValue', value)
}
</script>
