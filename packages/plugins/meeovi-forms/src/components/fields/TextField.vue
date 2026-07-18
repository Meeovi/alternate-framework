<template>
  <label class="field">
    <span>{{ label }}</span>
    <input :value="modelValue ?? ''" type="text" @input="onInput" />
  </label>
</template>

<script setup lang="ts">
export interface TextFieldProps {
  label: string
  modelValue: string | null
  schema?: Record<string, any>
}

defineProps<TextFieldProps>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const onInput = (event: Event) => emit('update:modelValue', (event.target as HTMLInputElement).value)
</script>

<style scoped>
.field { display: grid; gap: 0.35rem; }
</style>
