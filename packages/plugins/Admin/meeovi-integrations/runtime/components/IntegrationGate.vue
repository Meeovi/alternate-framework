<script setup lang="ts">
import { computed } from 'vue'
import { useIntegrations } from '../composables/useIntegrations'

/**
 * Renders its default slot only for users who installed the integration
 * providing `plugin`; otherwise the `fallback` slot (nothing by default).
 *
 *   <IntegrationGate plugin="@mframework/list-type-kanban">
 *     <Kanban />
 *     <template #fallback>Install Kanban to see this as a board.</template>
 *   </IntegrationGate>
 */
const props = defineProps<{ plugin: string }>()
const { isInstalled, pending } = useIntegrations()
const installed = computed(() => isInstalled(props.plugin))
</script>

<template>
  <slot v-if="installed" />
  <slot v-else-if="!pending" name="fallback" />
</template>
