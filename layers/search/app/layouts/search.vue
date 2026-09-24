<template>
  <div>
    <NuxtPwaManifest />
    <NuxtLoadingIndicator />
    <v-responsive class="border rounded">
          <v-app :theme="theme?.global?.name?.value" class="auto-text">
        <ClientOnly>
          <searchHeader />
        </ClientOnly>
        <OfflineAlert />
        <v-alert v-if="pwa?.offlineReady" type="success" density="compact" class="mb-2">
          App ready to work offline
        </v-alert>

        <v-main>
          <div class="page-wrapper">
            <div id="mainSection">
              <v-row>
                <v-col>
                  <live />
                </v-col>
              </v-row>
              <div class="contentPage">
                <slot />
              </div>
            </div>
          </div>
        </v-main>

        <bottomFooter />
      </v-app>
    </v-responsive>
  </div>
</template>

<script setup lang="ts">
  import searchHeader from '../components/menus/searchHeader.vue'
  import bottomFooter from '#social/app/components/menus/BottomFooter.vue'
  import live from '#social/app/components/menus/livebar/live.vue'
  import OfflineAlert from '#shared/app/components/alerts/OfflineAlert.vue'
  import {
    useTheme
  } from 'vuetify'

  let theme: any = null
  try {
    theme = useTheme()
  } catch {
    theme = null
  }

  const STORAGE_KEY = 'elite-theme'
  const pwa = usePWA()

  // Theme is now initialized via plugins (server + client)
  // This watcher just ensures persistence when user toggles theme
  watch(
    () => theme?.global?.name?.value,
    (value) => {
      if (typeof localStorage === 'undefined') return
      if (value) {
        localStorage.setItem(STORAGE_KEY, value)
        document.documentElement.setAttribute('data-theme', value)
      }
    },
  )

  useHead({
    meta: [{
        charset: 'utf-8'
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1'
      },
      {
        key: 'theme-color',
        name: 'theme-color',
        content: process.env.NUXT_PUBLIC_APP_THEME_COLOR || '#ffffff'
      }
    ],
    link: [{
      rel: 'icon',
      href: '/favicon.ico'
    }],
    htmlAttrs: {
      lang: 'en'
    }
  })

  const title = process.env.NUXT_PUBLIC_APP_NAME || 'Meeovi Search'
  const description = process.env.NUXT_PUBLIC_APP_DESCRIPTION ||
    '.'


  useSeoMeta({
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogImage: process.env.NUXT_PUBLIC_APP_OG_IMAGE || 'https://ui.nuxt.com/assets/templates/nuxt/chat-light.png',
    twitterCard: 'summary_large_image'
  })
</script>

<style scoped>
#mainSection {
  padding-bottom: 0px;
  bottom: 0px;
  height: 100vh;
}
</style>