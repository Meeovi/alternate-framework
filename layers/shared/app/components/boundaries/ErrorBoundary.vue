<template>
  <AlternateUIErrorBoundary :title="name || 'Something went wrong'" :show-details="showDetails">
    <slot />
  </AlternateUIErrorBoundary>
</template>

<script setup lang="ts">
import { ErrorBoundary as AlternateUIErrorBoundary } from 'alternate-ui/shared-ui/components'

defineProps<{
  name?: string
  showDetails?: boolean
  fallback?: string
}>()
</script>
