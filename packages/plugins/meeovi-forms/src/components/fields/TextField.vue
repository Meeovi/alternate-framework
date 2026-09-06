<template>
  <v-text-field
    :model-value="modelValue ?? ''"
    :label="label"
    variant="outlined"
    density="comfortable"
    hide-details="auto"
    class="field"
    @update:model-value="onInput"
  />
</template>

<script setup lang="ts">
export interface TextFieldProps {
  label: string
  modelValue: string | null
  schema?: Record<string, any>
}

defineProps<TextFieldProps>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const onInput = (value: string) => emit('update:modelValue', value)
</script>
