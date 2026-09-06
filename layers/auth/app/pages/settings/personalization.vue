<template>
    <div class="contentPage">
        <v-toolbar style="background-color: purple; color: white;">
            <v-toolbar-title>{{ accountPersonalization?.name }}</v-toolbar-title>
        </v-toolbar>

        <v-list lines="two">
            <v-list-subheader inset>Dark Mode</v-list-subheader>

            <v-list-item v-for="personalization in personalizations" :key="personalization.title"
                :subtitle="personalization.subtitle" :title="personalization.title">
                <template v-slot:prepend>
                    <v-avatar color="grey-lighten-1">
                        <v-icon color="white">fas fa-palette</v-icon>
                    </v-avatar>
                </template>

                <template v-slot:append>
                    <v-btn @click="toggleDark()" variant="text">
                        <v-icon>
                            {{ isDark ? 'fas fa-moon' : 'fas fa-sun' }}
                        </v-icon>
                    </v-btn>
                </template>
            </v-list-item>
        </v-list>
    </div>
</template>

<script setup>
    import {
        ref
    } from '#imports'
    import {
        useTheme
    } from 'vuetify'

    const personalizations = [{
        subtitle: 'Enable your platform wide dark mode.',
        title: 'Dark Mode',
    }]

    // Drawer state is now controlled by the layout
    let theme = null
    try {
        theme = useTheme()
    } catch {
        theme = null
    }

    const STORAGE_KEY = 'elite-theme'

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

    // Add theme toggling support for sidebar
    const isDark = computed(() => theme?.global?.name?.value === 'dark')

    function toggleDark() {
        if (!theme) return
        theme.global.name.value = theme.global.name.value === 'dark' ? 'light' : 'dark'
    }

    const {
        $directus,
        $readItems
    } = useNuxtApp()

    const {
      data: accountPersonalization
    } = await useAsyncData('accountPersonalization', async () => {
      const result = await $directus.request($readItems('pages', {
        filter: {
          slug: {
            _eq: 'personalization-settings'
          }
        },
        fields: '*',
        limit: 1
      }))
      return Array.isArray(result) ? result[0] : null
    })

  useHead({
    title: () => accountPersonalization.value?.name || 'Page',
  })
</script>