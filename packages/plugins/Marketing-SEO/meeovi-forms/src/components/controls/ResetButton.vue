<template>
  <button type="button" @click="$emit('click')">
    <slot>Reset</slot>
  </button>
</template>

<script setup lang="ts">
export interface ResetButtonProps {
  disabled?: boolean
}

defineProps<ResetButtonProps>()
</script>