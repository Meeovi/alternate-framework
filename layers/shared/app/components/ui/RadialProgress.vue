<template>
  <AlternateUIRadialProgress v-bind="$props" />
</template>

<script setup lang="ts">
import { RadialProgress as AlternateUIRadialProgress } from 'alternate-ui/shared-ui/components'

defineProps<{
  radius?: number
  progress?: number
  stroke?: number
}>()
</script>
