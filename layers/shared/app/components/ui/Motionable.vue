<template>
  <AlternateUIMotionable v-bind="$props">
    <slot />
  </AlternateUIMotionable>
</template>

<script setup lang="ts">
import { Motionable as AlternateUIMotionable } from 'alternate-ui/shared-ui/components'

defineProps<{
  as?: string | object
  name: string
  show?: boolean
}>()
</script>
