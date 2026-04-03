<template>
  <div>
    <NuxtPwaManifest />
    <NuxtLoadingIndicator />
  <v-responsive class="border rounded">
    <v-app :theme="theme?.global?.name?.value" class="auto-text">
      <Header />

      <v-main>
        <v-card>
          <v-layout>
            <v-navigation-drawer v-model="drawer" temporary>
              <sidebarnav />
              <v-spacer />
            </v-navigation-drawer>

            <v-main id="sidebarNav" />
            <main id="mainSection">
              <slot />
            </main>
          </v-layout>
        </v-card>

        <Footer />
      </v-main>
    </v-app>
  </v-responsive>

    <ClientOnly>
      <div v-if="$pwa?.offlineReady || $pwa?.needRefresh" class="pwa-toast" role="alert">
        <div class="message">
          <span v-if="$pwa.offlineReady">
            App ready to work offline
          </span>
          <span v-else>
            New content available, click on reload button to update.
          </span>
        </div>
        <v-btn v-if="$pwa.needRefresh" @click="$pwa.updateServiceWorker()">
          Reload
        </v-btn>
        <v-btn @click="$pwa.cancelPrompt()">
          Close
        </v-btn>
      </div>
      <div v-if="$pwa?.showInstallPrompt && !$pwa?.offlineReady && !$pwa?.needRefresh" class="pwa-toast" role="alert">
        <div class="message">
          <span>
            Install PWA
          </span>
        </div>
        <v-btn @click="$pwa.install()">
          Install
        </v-btn>
        <v-btn @click="$pwa.cancelInstall()">
          Cancel
        </v-btn>
      </div>
    </ClientOnly>
  </div>
</template>

<script setup>
  import {
    ref,
    watch,
    onMounted
  } from 'vue'
  import {
    useTheme
  } from 'vuetify'

  const drawer = ref(null)
  const theme = useTheme()

  const STORAGE_KEY = 'elite-theme'

  // Load saved theme on mount
  onMounted(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      theme.global.name.value = stored
    }
  })

  // Save theme when it changes
  watch(
    () => theme.global.name.value,
    (val) => {
      if (val) localStorage.setItem(STORAGE_KEY, val)
    }
  )

  useSeoMeta({
    title: 'Starter Template'
  })
</script>

<style>
  .pwa-toast {
    position: fixed;
    right: 0;
    bottom: 0;
    margin: 16px;
    padding: 12px;
    border: 1px solid #8885;
    border-radius: 4px;
    z-index: 1;
    text-align: left;
    box-shadow: 3px 4px 5px 0 #8885;
  }

  .pwa-toast .message {
    margin-bottom: 8px;
  }

  .pwa-toast button {
    border: 1px solid #8885;
    outline: none;
    margin-right: 5px;
    border-radius: 2px;
    padding: 3px 10px;
  }
</style>