<template>
  <label class="field">
    <span>{{ label }}</span>
    <input :value="modelValue ?? ''" type="date" @input="onInput" />
  </label>
</template>

<script setup lang="ts">
defineProps<{ label: string; modelValue: string | null; schema?: Record<string, any> }>()
const emit = defineEmits<{ 'update:modelValue': [string] }>()
const onInput = (event: Event) => emit('update:modelValue', (event.target as HTMLInputElement).value)
</script>

<style scoped>
.field { display: grid; gap: 0.35rem; }
</style>
