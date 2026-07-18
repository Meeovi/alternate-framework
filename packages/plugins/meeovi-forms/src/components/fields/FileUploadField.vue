<template>
  <label class="field">
    <span>{{ label }}</span>
    <input type="file" @change="onChange" />
  </label>
</template>

<script setup lang="ts">
export interface FileUploadFieldProps {
  label: string
  modelValue?: File | null
  schema?: Record<string, any>
}

defineProps<FileUploadFieldProps>()
const emit = defineEmits<{ 'update:modelValue': [value: File | null] }>()

const onChange = (event: Event) => {
  const files = (event.target as HTMLInputElement).files
  emit('update:modelValue', files && files.length > 0 ? files[0] : null)
}
</script>

<style scoped>
.field { display: grid; gap: 0.35rem; }
</style>
