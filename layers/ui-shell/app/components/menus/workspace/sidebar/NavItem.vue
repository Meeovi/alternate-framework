<script setup lang="ts">
import NavIcon from './NavIcon.vue'
import type { WorkspaceMenu } from '../../../../composables/useWorkspaceShell'

const props = defineProps<{ item: WorkspaceMenu, level?: number }>()
const external = props.item.type === 'external'
</script>

<template>
  <v-list-item
    :to="external ? undefined : item.to"
    :href="external ? item.to : undefined"
    :target="external ? '_blank' : undefined"
    rounded
    class="mb-1"
    color="secondary"
    :disabled="item.disabled"
  >
    <template #prepend>
      <NavIcon :icon="item.icon" :level="level" />
    </template>
    <v-list-item-title>{{ item.title }}</v-list-item-title>
    <v-list-item-subtitle v-if="item.subCaption" class="text-caption mt-n1 hide-menu">
      {{ item.subCaption }}
    </v-list-item-subtitle>
    <template v-if="item.chip" #append>
      <v-chip
        :color="item.chipColor"
        class="sidebarchip hide-menu"
        :size="item.chipIcon ? 'small' : 'default'"
        :variant="item.chipVariant"
        :prepend-icon="item.chipIcon"
      >
        {{ item.chip }}
      </v-chip>
    </template>
  </v-list-item>
</template>
