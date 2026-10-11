<template>
  <div>
    <NuxtPwaManifest />
    <NuxtLoadingIndicator color="rgb(var(--v-theme-secondary))" />
    <v-defaults-provider :defaults="defaults">
      <v-app
        :theme="themeName"
        :class="['workspace-shell', fontTheme, miniSidebar ? 'mini-sidebar' : '', inputBg ? 'inputWithbg' : '']"
      >
        <Customizer />
        <VerticalSidebar :sidebar-menu="sidebarMenu" />
        <VerticalHeader :user="user" />

        <v-main>
          <v-container fluid class="page-wrapper">
            <div>
              <slot />
              <v-btn
                class="customizer-btn"
                size="large"
                icon
                variant="flat"
                color="secondary"
                @click.stop="customizerDrawer = !customizerDrawer"
              >
                <v-icon icon="fas fa-gear" class="icon" />
              </v-btn>
            </div>
          </v-container>
          <v-container fluid class="pt-0">
            <FooterPanel />
          </v-container>
        </v-main>
      </v-app>
    </v-defaults-provider>
  </div>
</template>

<script setup lang="ts">
  // Berry admin chrome (CodedThemes, MIT) for apps/ecosystem/meeovi-workspace.
  import '../assets/workspace/berry.css'
  import VerticalSidebar from '../components/menus/workspace/sidebar/VerticalSidebar.vue'
  import VerticalHeader from '../components/menus/workspace/VerticalHeader.vue'
  import Customizer from '../components/menus/workspace/CustomizerPanel.vue'
  import FooterPanel from '../components/menus/workspace/FooterPanel.vue'

  const themeName = useWorkspaceTheme()

  // Data for the chrome is fetched here, above <v-app>, so the whole layout
  // renders once it's ready. Fetching inside VerticalSidebar/VerticalHeader
  // deferred their SSR render past <v-main>, which then missed the drawer /
  // app bar offsets (hydration mismatch + content jump).
  const sidebarMenu = useWorkspaceSidebar()
  const user = useWorkspaceSession()
  const { customizerDrawer, miniSidebar, fontTheme, inputBg } = useWorkspaceCustomizer()

  // Berry's createVuetify() defaults, scoped to this layout.
  const defaults = {
    VCard: { rounded: 'md' },
    VTextField: { rounded: 'lg' },
    VTooltip: { location: 'top' }
  }
</script>
