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

const props = defineProps<{ label: string; modelValue: string | number | null; schema?: Record<string, any> }>()
const emit = defineEmits<{ 'update:modelValue': [string] }>()

const options = computed(() => props.schema?.enum || [])
const onChange = (event: Event) => emit('update:modelValue', (event.target as HTMLSelectElement).value)
</script>

<style scoped>
.field { display: grid; gap: 0.35rem; }
</style>
