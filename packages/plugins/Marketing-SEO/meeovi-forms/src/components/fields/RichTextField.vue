<template>
  <v-textarea
    :model-value="modelValue ?? ''"
    :label="label"
    rows="6"
    auto-grow
    variant="outlined"
    density="comfortable"
    hide-details="auto"
    class="field"
    @update:model-value="onInput"
  />
</template>

<script setup lang="ts">
export interface RichTextFieldProps {
  label: string
  modelValue: string | null
  schema?: Record<string, any>
}

defineProps<RichTextFieldProps>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const onInput = (value: string) => emit('update:modelValue', value)
</script>
