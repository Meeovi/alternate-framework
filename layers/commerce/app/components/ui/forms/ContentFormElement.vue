<template>
  <div class="content-form-element">
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  field?: any
  modelValue?: any
}>()

defineEmits<{
  (e: 'update:modelValue', value: any): void
}>()
</script>