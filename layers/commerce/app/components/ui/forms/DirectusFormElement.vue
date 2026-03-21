<!-- Local stub for DirectusFormElement -->
<template>
  <div class="directus-form-element">
    <slot />
  </div>
</template>

<script setup lang="ts">
// Stub component - parent app should provide actual Directus form integration
defineProps<{
  field?: any
  modelValue?: any
}>()

defineEmits<{
  (e: 'update:modelValue', value: any): void
}>()
</script>
