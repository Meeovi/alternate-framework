<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Logo from '../../../blocks/workspace/logo.vue'
import NavGroup from './NavGroup.vue'
import NavItem from './NavItem.vue'
import NavCollapse from './NavCollapse.vue'
import type { WorkspaceMenu } from '../../../../composables/useWorkspaceShell'

const { sidebarDrawer, miniSidebar } = useWorkspaceCustomizer()

// ui-shell's Vuetify renders SSR at width 0 (i.e. "mobile"), which hid the
// drawer on desktop until hydration. Render SSR/hydration as desktop
// (breakpoint 0 = never mobile), then switch to the real `lg` breakpoint —
// below it Vuetify turns the drawer temporary and closes it.
const mobileBreakpoint = ref<'lg' | 0>(0)
onMounted(() => { mobileBreakpoint.value = 'lg' })

// Built from Directus `navigation` records by the layout (useWorkspaceSidebar).
defineProps<{ sidebarMenu: WorkspaceMenu[] }>()
</script>

<template>
  <v-navigation-drawer
    v-model="sidebarDrawer"
    left
    elevation="0"
    rail-width="75"
    :mobile-breakpoint="mobileBreakpoint"
    app
    class="leftSidebar"
    :rail="miniSidebar"
    expand-on-hover
  >
    <div class="pa-5">
      <Logo />
    </div>
    <div class="scrollnavbar ws-scroll">
      <v-list class="pa-4">
        <template v-for="(item, i) in sidebarMenu" :key="i">
          <NavGroup v-if="item.header" :item="item" />
          <v-divider v-else-if="item.divider" class="my-3" />
          <NavCollapse v-else-if="item.children" class="leftPadding" :item="item" :level="0" />
          <NavItem v-else :item="item" class="leftPadding" />
        </template>
      </v-list>
    </div>
  </v-navigation-drawer>
</template>
