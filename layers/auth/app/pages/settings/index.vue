<template>
    <v-card height="200" class="contentPage">
        <v-toolbar extended
            :style="`background-color: ${settingsBar?.color}; color: ${settingsBar?.colortext} !important`">
            <v-toolbar-title>{{ settingsBar?.name }}</v-toolbar-title>

            <v-tabs v-model="tab" align-tabs="center">
                <div v-for="(menu, index) in settingsBar?.menus" :key="index">
                    <v-tab :value="menu?.value">
                        <v-btn variant="text"
                            :style="`color: ${settingsBar?.colortext} !important`">{{ menu?.name }}</v-btn>
                    </v-tab>
                </div>
            </v-tabs>
        </v-toolbar>

        <v-tabs-window v-model="tab">
            <v-tabs-window-item :value="settingsBar?.menus?.[0]?.value">
                <Home />
            </v-tabs-window-item>
            <v-tabs-window-item :value="settingsBar?.menus?.[1]?.value">
                <Social />
            </v-tabs-window-item>
            <v-tabs-window-item :value="settingsBar?.menus?.[2]?.value">
                <Personalization />
            </v-tabs-window-item>
            <v-tabs-window-item :value="settingsBar?.menus?.[3]?.value">
                <Devices />
            </v-tabs-window-item>
            <v-tabs-window-item :value="settingsBar?.menus?.[4]?.value">
                <Gaming />
            </v-tabs-window-item>
            <v-tabs-window-item :value="settingsBar?.menus?.[5]?.value">
                <Languages />
            </v-tabs-window-item>
            <v-tabs-window-item :value="settingsBar?.menus?.[6]?.value">
                <Privacy />
            </v-tabs-window-item>
            <v-tabs-window-item :value="settingsBar?.menus?.[7]?.value">
                <Accessibility />
            </v-tabs-window-item>
            <v-tabs-window-item :value="settingsBar?.menus?.[8]?.value">
                <Shopping />
            </v-tabs-window-item>
        </v-tabs-window>
    </v-card>
</template>

<script setup>
    import { ref } from '#imports'
    import Home from './home.vue'
    import Social from './social.vue'
    import Personalization from './personalization.vue'
    import Devices from './devices.vue'
    import Gaming from './gaming.vue'
    import Languages from './languages.vue'
    import Privacy from './privacy.vue'
    import Accessibility from './accessibility.vue'
    import Shopping from './shopping.vue'

    const {
        $directus,
        $readItem,
    } = useNuxtApp()
    const tab = ref(null)

    const {
        data: settingsBar
    } = await useAsyncData('settingsBar', () => {
        return $directus.request($readItem('navigation', '25', {
            fields: ['*', {
                '*': ['*']
            }]
        }))
    })

    useHead({
        title: 'Settings Center',
    })
</script>