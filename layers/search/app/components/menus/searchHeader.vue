<template>
  <div>
    <v-app-bar id="topnav">
      <v-row>
        <v-col class="d-flex align-center flex-column flex-sm-row fill-height leftNav" cols="4">
          <NuxtLink to="/about">About</NuxtLink>

          <NuxtLink to="https://www.meeovi.com">Shop</NuxtLink>
        </v-col>

        <v-col class="d-flex align-center flex-column flex-sm-row fill-height" cols="4" />

        <v-col class="d-flex align-center flex-column flex-sm-row fill-height rightNav" cols="4">
          <div class="rightLinks">
            <NuxtLink to="https://www.collaborrate.com">Collaborrate</NuxtLink>

            <NuxtLink to="https://www.pixanomy.com">Pixanomy</NuxtLink>
          </div>

          <div>
            <v-btn @click="toggleDark()" variant="text">
              <v-icon>
                {{ isDark ? 'fas fa-moon' : 'fas fa-sun' }}
              </v-icon>
            </v-btn>
          </div>

          <div class="ecosystemMenuIcon">
            <ecosystemmenu />
          </div>

          <div class="myaccounttopmenu">
            <myaccounttopmenu />
          </div>
        </v-col>
      </v-row>
    </v-app-bar>
  </div>
</template>

<script setup>
  import {
    onMounted,
    watch,
    computed
  } from 'vue'
  import {
    useTheme
  } from 'vuetify'
  import ecosystemmenu from './topmenu/ecosystemmenu.vue'
  import myaccounttopmenu from './topmenu/accountMenu.vue'

  defineProps({
    drawer: {
      type: Boolean,
      default: false
    }
  })

  defineEmits(['toggleDrawer'])

  const theme = useTheme()
  const isDark = computed(() => theme.global.current.value.dark)
  const setTheme = (name) => {
    theme.change(name)
  }

  // Local storage key
  const STORAGE_KEY = 'elite-theme'

  // Determine initial mode
  onMounted(() => {
    const stored = localStorage.getItem(STORAGE_KEY)

    if (stored === 'light' || stored === 'dark') {
      // Use saved preference
      setTheme(stored)
    } else {
      // No preference — follow system
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setTheme(prefersDark ? 'dark' : 'light')
    }
  })

  // Toggle between themes
  const toggleDark = () => {
    setTheme(theme.global.current.value.dark ? 'light' : 'dark')
  }

  // Save preference whenever theme changes
  watch(
    () => theme.global.name.value,
    (val) => {
      localStorage.setItem(STORAGE_KEY, val)
    }
  )

</script>

<style scoped>
  #topnav {
    background-color: transparent !important;
  }

  .leftNav {
    padding-left: 20px;
    padding-top: 12px;
  }

  .leftNav>a {
    padding-right: 20px;
    font-size: 18px;
  }

  .rightNav {
    position: fixed;
    right: 20px;
    top: 5px;
  }

  .rightLinks a {
    padding-right: 20px;
    font-size: 18px;
  }
</style>
