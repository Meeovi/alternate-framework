<template>
  <label class="field">
    <span>{{ label }}</span>
    <input type="file" @change="onChange" />
  </label>
</template>

<script setup lang="ts">
defineProps<{ label: string; modelValue?: File | null; schema?: Record<string, any> }>()
const emit = defineEmits<{ 'update:modelValue': [File | null] }>()

const onChange = (event: Event) => {
  const files = (event.target as HTMLInputElement).files
  emit('update:modelValue', files && files.length > 0 ? files[0] : null)
}
</script>

<style scoped>
.field { display: grid; gap: 0.35rem; }
</style>
