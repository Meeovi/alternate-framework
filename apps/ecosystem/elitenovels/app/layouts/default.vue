<template>
  <v-responsive>
    <v-app :theme="theme.value">
      <v-app-bar id="topnav" density="compact">
        <template v-slot:prepend>
          <v-btn variant="flat" @click="drawer = !drawer">
            <v-icon start icon="fas fa-bars"></v-icon>
            <div class="menutext"> Browse the Eliteverse</div>
          </v-btn>
        </template>

        <!--<v-app-bar-title><a class="logobrand" href="https://kids.elitenovels.com">Elite Kids</a></v-app-bar-title>-->
        <v-divider class="border-opacity-100" inset vertical color="success"></v-divider>

        <v-spacer></v-spacer>

        <logo />
        <v-spacer></v-spacer>

        <div class="d-flex align-center flex-column flex-sm-row fill-height rightNav">
          <ecosystemmenu />
          <v-divider class="border-opacity-100" inset vertical color="primary"></v-divider>
          <v-col>
            <search />
          </v-col>
        </div>
      </v-app-bar>

      <v-main>
        <v-card>
          <v-layout>
            <v-navigation-drawer class="sidebarSection" v-model="drawer" temporary>
              <div class="drawer-content">
                <v-list nav>

                  <!---->
                  <sidebar />
                  <v-divider></v-divider>
                  <v-row>
                    <v-col cols="3">
                      <v-btn variant="text" stacked title="Help Center" prepend-icon="fas fa-question-circle"
                        size="medium" href="https://help.meeovi.com"></v-btn>
                    </v-col>
                    <v-col cols="3">
                      <v-btn @click="toggleDark" variant="text" size="medium">
                        <v-icon>
                          {{ theme.global.current.value.dark ? 'fas fa-sun' : 'fas fa-moon' }}
                        </v-icon>
                      </v-btn>

                    </v-col>
                    <v-col cols="3">
                      <!--<logout />-->
                    </v-col>
                  </v-row>
                </v-list>
              </div>
            </v-navigation-drawer>

            <v-main id="sidebarNav"></v-main>
            <main id="mainSection">
              <!--<lowerbar />-->
              <slot />

              <!--<relatedproducts />-->
            </main>
          </v-layout>
        </v-card>

        <BottomFooter />
        <FooterNav />
      </v-main>
    </v-app>
  </v-responsive>
</template>

<script setup>
  import {
    ref
  } from 'vue'
  import {
    useDark,
    useToggle
  } from '@vueuse/core'
  import {
    useTheme
  } from 'vuetify'
  import ecosystemmenu from '~/components/menus/ecosystemmenu.vue'
  import sidebar from '~/components/menus/sidebar.vue'
  import search from '~/components/search/search.vue'
  //import lowerbar from '~/components/menus/lowerbar.vue'
  import FooterNav from '~/components/menus/FooterNav.vue'
  import BottomFooter from '~/components/menus/BottomFooter.vue'
  //import relatedproducts from '~/components/related/relatedproducts.vue'
  import logo from '~/components/blocks/logo.vue'

  const drawer = ref(null);

  const theme = useTheme()

  // Local storage key
  const STORAGE_KEY = 'elite-theme'

  // Determine initial mode
  onMounted(() => {
    const stored = localStorage.getItem(STORAGE_KEY)

    if (stored) {
      // Use saved preference
      theme.global.name.value = stored
    } else {
      // No preference — follow system
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      theme.global.name.value = prefersDark ? 'dark' : 'light'
    }
  })

  // Toggle between themes
  const toggleDark = () => {
    theme.global.name.value =
      theme.global.current.value.dark ? 'light' : 'dark'
  }

  // Save preference whenever theme changes
  watch(
    () => theme.global.name.value,
    (val) => {
      localStorage.setItem(STORAGE_KEY, val)
    }
  )
</script>