<!-- Local stub for DataFormElement -->
<template>
  <div class="data-form-element">
    <slot />
  </div>
</template>

<script setup lang="ts">
// Stub component - parent app should provide actual Data form integration
defineProps<{
  field?: any
  modelValue?: any
}>()

defineEmits<{
  (e: 'update:modelValue', value: any): void
}>()
</script>
