<template>
  <label class="field">
    <span>{{ label }}</span>
    <select :value="modelValue ?? ''" @change="onChange">
      <option v-for="option in options" :key="String(option)" :value="String(option)">{{ option }}</option>
    </select>
  </label>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface SelectFieldProps {
  label: string
  modelValue: string | number | null
  schema?: Record<string, any>
}

defineProps<SelectFieldProps>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const options = computed(() => (props.schema?.enum || []) as unknown[])
const onChange = (event: Event) => emit('update:modelValue', (event.target as HTMLSelectElement).value)
</script>

<style scoped>
.field { display: grid; gap: 0.35rem; }
</style>
