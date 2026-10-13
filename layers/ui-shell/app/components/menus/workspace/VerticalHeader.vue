<script setup lang="ts">
import ProfileDD from './ProfileDD.vue'
import type { WorkspaceUser } from '../../../composables/useWorkspaceShell'
import Searchbar from './SearchBarPanel.vue'

const { sidebarDrawer } = useWorkspaceCustomizer()
const showSearch = ref(false)

// Fetched by the layout (useWorkspaceSession) — see the note there.
defineProps<{ user?: WorkspaceUser | null }>()
</script>

<template>
  <v-app-bar elevation="0" height="80">
    <!-- opens / closes the sidebar on every screen size -->
    <v-btn
      class="text-secondary ms-3"
      color="lightsecondary"
      icon
      rounded="sm"
      variant="flat"
      size="small"
      :aria-label="sidebarDrawer ? 'Close menu' : 'Open menu'"
      @click.stop="sidebarDrawer = !sidebarDrawer"
    >
      <v-icon icon="fas fa-bars" size="18" />
    </v-btn>

    <!-- search mobile -->
    <v-btn
      class="hidden-lg-and-up text-secondary ml-3"
      color="lightsecondary"
      icon
      rounded="sm"
      variant="flat"
      size="small"
      @click="showSearch = !showSearch"
    >
      <v-icon icon="fas fa-magnifying-glass" size="15" />
    </v-btn>

    <v-sheet v-if="showSearch" class="search-sheet pa-3" width="100%" style="left: 0; top: 80px">
      <Searchbar :closesearch="() => (showSearch = false)" />
    </v-sheet>

    <v-sheet class="mx-3 d-none d-lg-block" width="100%" max-width="360">
      <Searchbar />
    </v-sheet>

    <v-spacer />

    <!-- notifications: layers/shared /notifications -->
    <v-btn icon class="text-secondary mx-3" color="lightsecondary" rounded="sm" size="small" variant="flat" to="/notifications">
      <v-icon icon="far fa-bell" size="18" />
    </v-btn>

    <v-menu :close-on-content-click="false">
      <template #activator="{ props }">
        <v-btn class="profileBtn text-primary" color="lightprimary" variant="flat" rounded="pill" v-bind="props">
          <v-avatar size="30" class="mr-2 py-2">
            <img v-if="user?.image" :src="user.image" :alt="user.name || 'Profile'" width="30">
            <img v-else src="../../../assets/workspace/user-round.svg" alt="Profile" width="30">
          </v-avatar>
          <v-icon icon="fas fa-gear" size="18" />
        </v-btn>
      </template>
      <v-sheet rounded="md" width="330" elevation="12">
        <ProfileDD :user="user" />
      </v-sheet>
    </v-menu>
  </v-app-bar>
</template>
