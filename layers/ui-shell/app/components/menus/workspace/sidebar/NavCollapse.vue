<script setup lang="ts">
import NavItem from './NavItem.vue'
import NavIcon from './NavIcon.vue'
import type { WorkspaceMenu } from '../../../../composables/useWorkspaceShell'

defineOptions({ name: 'NavCollapse' })
const props = defineProps<{ item: WorkspaceMenu, level: number }>()
</script>

<template>
  <v-list-group no-action>
    <template #activator="{ props: activator }">
      <v-list-item v-bind="activator" :value="item.title" rounded class="mb-1" color="secondary">
        <template #prepend>
          <NavIcon :icon="item.icon" :level="level" />
        </template>
        <v-list-item-title class="mr-auto">{{ item.title }}</v-list-item-title>
        <v-list-item-subtitle v-if="item.subCaption" class="text-caption mt-n1 hide-menu">
          {{ item.subCaption }}
        </v-list-item-subtitle>
      </v-list-item>
    </template>
    <template v-for="(subitem, i) in item.children" :key="i">
      <NavCollapse v-if="subitem.children" :item="subitem" :level="props.level + 1" />
      <NavItem v-else :item="subitem" :level="props.level + 1" />
    </template>
  </v-list-group>
</template>
