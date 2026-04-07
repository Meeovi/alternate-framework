<template>
  <AlternateUIButton v-bind="$attrs">
    <slot />
  </AlternateUIButton>
</template>

<script setup lang="ts">
import { Button as AlternateUIButton } from 'alternate-ui/shared-ui/components'
</script>