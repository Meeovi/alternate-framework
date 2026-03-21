<template>
  <v-app :theme="theme">
    <v-app-bar color="primary">
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-app-bar-title><logo class="logobrand" /></v-app-bar-title>
      
      <v-spacer></v-spacer>

        <div class="d-flex align-center flex-column flex-sm-row fill-height">
          <v-btn class="darkIcon" icon @click="toggleDark()">
            <v-icon>{{ isDark ? 'fas fa-moon' : 'fas fa-sun' }}</v-icon>
          </v-btn>

          <v-col class="ecosystemMenuIcon">
            <ecosystemmenu />
          </v-col>
        </div>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" temporary width="300">
      <v-list>
        <logo class="ma-4" />
        <sidebarmenu />
      </v-list>
    </v-navigation-drawer>

    <v-main class="bg-background">
      <NuxtPage />
    </v-main>

    <v-footer app class="d-flex flex-column">
      <div class="text-center">
        © {{ new Date().getFullYear() }} Meeovi Dates. All rights reserved.
      </div>
    </v-footer>
  </v-app>
</template>

<script setup>
  import {
    ref,
    onMounted,
    onUnmounted,
    watch,
    nextTick
  } from 'vue'
  import {
    useDark,
    useToggle
  } from '@vueuse/core'
  import {
    useTheme
  } from 'vuetify'

  import logo from '../components/blocks/logo.vue'
  import ecosystemmenu from '../components/menus/ecosystemmenu.vue'
  import sidebarmenu from '../components/menus/sidebarmenu.vue'

  const theme = useTheme()
  const isDark = useDark()
  const toggleDark = useToggle(isDark)

  // Sync Vuetify theme with dark mode
  watch(isDark, (dark) => {
    theme.global.name.value = dark ? 'dark' : 'light'
  }, {
    immediate: true
  })

  // Calculator state
  const drawer = ref(false)
 
  useHead({
    title: 'Meeovi Dates',
    htmlAttrs: {
      // uncomment this line to simulate dark mode
      // class: 'dark',
    },
  })
</script>

<style>
  .v-main {
    background-color: #f5f5f5;
    height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .v-container {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .full-height-component {
    width: 100%;
    height: 100%;
    max-width: 100%;
    display: flex;
    flex-direction: column;
  }

  @media (min-width: 600px) {
    .full-height-component {
      max-width: 800px;
      margin: 0 auto;
    }
  }

  .calculator-focus-container {
    width: 100%;
    height: 100%;
    outline: none;
    position: relative;
  }

  .calculator-focus-container:focus {
    outline: 2px solid rgba(var(--v-theme-primary), 0.3);
    outline-offset: -2px;
  }

  /* Ensure keyboard focus is visible */
  .calculator-focus-container:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: -2px;
  }
</style>