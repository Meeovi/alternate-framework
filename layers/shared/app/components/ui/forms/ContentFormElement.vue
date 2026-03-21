<template>
  <LegacyFormElement v-bind="$attrs" />
</template>

<script setup lang="ts">
import LegacyFormElement from './ContentFormElement.vue'

defineOptions({
  inheritAttrs: false,
})
</script>