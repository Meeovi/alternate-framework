<template>
  <label class="field">
    <span>{{ label }}</span>
    <input :value="modelValue ?? 0" type="number" @input="onInput" />
  </label>
</template>

<script setup lang="ts">
defineProps<{ label: string; modelValue: number | null; schema?: Record<string, any> }>()
const emit = defineEmits<{ 'update:modelValue': [number] }>()
const onInput = (event: Event) => emit('update:modelValue', Number((event.target as HTMLInputElement).value))
</script>

<style scoped>
.field { display: grid; gap: 0.35rem; }
</style>
