<template>
  <button type="submit" :disabled="disabled">
    <slot>Submit</slot>
  </button>
</template>

<script setup lang="ts">
export interface SubmitButtonProps {
  disabled?: boolean
}

defineProps<SubmitButtonProps>()
</script>
