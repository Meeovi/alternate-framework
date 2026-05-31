<template>
  <label class="field">
    <span>{{ label }}</span>
    <textarea :value="modelValue ?? ''" rows="6" @input="onInput" />
  </label>
</template>

<script setup lang="ts">
defineProps<{ label: string; modelValue: string | null; schema?: Record<string, any> }>()
const emit = defineEmits<{ 'update:modelValue': [string] }>()
const onInput = (event: Event) => emit('update:modelValue', (event.target as HTMLTextAreaElement).value)
</script>

<style scoped>
.field { display: grid; gap: 0.35rem; }
textarea { resize: vertical; }
</style>
