<template>
    <div>
        <v-app-bar id="topnav" :density="smAndDown ? 'compact' : 'default'">
            <template v-slot:prepend>
                <v-btn class="mainMenu" variant="flat" color="transparent" @click="$emit('toggleDrawer')">
                    <v-icon start icon="fas fa-camera"></v-icon> Menu
                </v-btn>
            </template>
            
                <logo />

                <v-spacer></v-spacer>

                    <div class="d-flex align-center fill-height rightTopNav">
                        <v-btn class="pixHeaderLink" variant="text" :href="mediaUrl" title="Your media library"
                            :icon="smAndDown" aria-label="Media">
                            <v-icon :start="!smAndDown" icon="fas fa-photo-film"></v-icon>
                            <span v-if="!smAndDown">Media</span>
                        </v-btn>
                        <div class="myaccounttopmenu">
                            <v-btn title="Go to the Pixanomy App" text="Get Started" :href="appUrl"></v-btn>
                        </div>

                        <div class="ecosystemMenuIcon">
                            <ecosystemmenu />
                        </div>
                    </div>
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
        useDisplay,
        useTheme
    } from 'vuetify'
    import logo from '../../blocks/pixanomy/logo.vue'
    import ecosystemmenu from './topmenu/ecosystemmenu.vue'

    defineProps({
        drawer: {
            type: Boolean,
            default: false
        }
    })

    defineEmits(['toggleDrawer'])

    // Set per app in appConfig.pixanomy (apps/ecosystem/pixanomy-frontend/nuxt.config.ts)
    const pixanomyConfig = useAppConfig().pixanomy || {}
    const mediaUrl = pixanomyConfig.mediaUrl || 'https://meeovi.com/workspace/content/manage-media'
    const appUrl = pixanomyConfig.appUrl || 'https://app.pixanomy.com'

    const drawer = ref(null);
    const placeholder = 'Search your media, assets, templates, and more'
    const theme = useTheme()
    // Compact bar on phones; Vuetify keeps v-main's top offset in sync with the bar height
    const { smAndDown } = useDisplay()
    const themeName = computed(() => theme.global.name.value)
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