<template>
  <v-text-field
    :model-value="modelValue ?? 0"
    :label="label"
    type="number"
    variant="outlined"
    density="comfortable"
    hide-details="auto"
    class="field"
    @update:model-value="onInput"
  />
</template>

<script setup lang="ts">
export interface NumberFieldProps {
  label: string
  modelValue: number | null
  schema?: Record<string, any>
}

defineProps<NumberFieldProps>()
const emit = defineEmits<{ 'update:modelValue': [value: number] }>()

const onInput = (value: string) => emit('update:modelValue', Number(value))
</script>
