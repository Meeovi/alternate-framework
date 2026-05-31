<template>
  <button type="submit" :disabled="disabled">
    <slot>Submit</slot>
  </button>
</template>

<script setup lang="ts">
defineProps<{ disabled?: boolean }>()
</script>
