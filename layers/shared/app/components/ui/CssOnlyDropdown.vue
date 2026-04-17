<template>
  <AlternateUICssOnlyDropdown v-bind="$props">
    <template v-if="$slots.trigger" #trigger>
      <slot name="trigger" />
    </template>
    <slot />
  </AlternateUICssOnlyDropdown>
</template>

<script setup lang="ts">
import { CssOnlyDropdown as AlternateUICssOnlyDropdown } from 'alternate-ui/shared-ui/components'

defineProps<{
  label?: string
}>()
</script>
