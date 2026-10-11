<script setup lang="ts">
import type { WorkspaceMenu } from '../../../../composables/useWorkspaceShell'

defineProps<{ item: WorkspaceMenu }>()
</script>

<template>
  <v-list-subheader color="darkText" class="smallCap hide-menu">{{ item.header }}</v-list-subheader>
</template>
