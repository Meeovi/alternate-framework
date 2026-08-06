<template>
  <label class="field">
    <span>{{ label }}</span>
    <input type="checkbox" :checked="Boolean(modelValue)" @change="onChange" />
  </label>
</template>

<script setup lang="ts">
export interface BooleanInputProps {
  label: string
  modelValue: boolean | null
  schema?: Record<string, any>
}

defineProps<BooleanInputProps>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

const onChange = (event: Event) => {
  emit('update:modelValue', (event.target as HTMLInputElement).checked)
}
</script>

<style scoped>
.field { display: grid; gap: 0.35rem; }
</style>
