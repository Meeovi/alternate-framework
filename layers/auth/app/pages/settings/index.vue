<template>
    <v-card height="200">
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
            <v-tabs-window-item value="one">
                <Home />
            </v-tabs-window-item>
            <v-tabs-window-item value="two">
                <Social />
            </v-tabs-window-item>
            <v-tabs-window-item value="three">
                <Personalization />
            </v-tabs-window-item>
            <v-tabs-window-item value="four">
                <Devices />
            </v-tabs-window-item>
            <v-tabs-window-item value="five">
                <Gaming />
            </v-tabs-window-item>
            <v-tabs-window-item value="six">
                <Languages />
            </v-tabs-window-item>
            <v-tabs-window-item value="seven">
                <Privacy />
            </v-tabs-window-item>
            <v-tabs-window-item value="eight">
                <Subscriptions />
            </v-tabs-window-item>
            <v-tabs-window-item value="nine">
                <Accessibility />
            </v-tabs-window-item>
            <v-tabs-window-item value="ten">
                <Shopping />
            </v-tabs-window-item>
        </v-tabs-window>
    </v-card>
</template>

<script setup>
    import {
        ref,
        defineAsyncComponent
    } from '#imports'
    import Home from '../../components/features/settings/home.vue'
    import Social from '../../components/features/settings/social.vue'
    import Personalization from '../../components/features/settings/personalization.vue'
    import Devices from '../../components/features/settings/devices.vue'
    import Gaming from '../../components/features/settings/gaming.vue'
    import Languages from '../../components/features/settings/languages.vue'
    import Privacy from '../../components/features/settings/privacy.vue'
    import Subscriptions from '../../components/features/settings/subscriptions.vue'
    import Accessibility from '../../components/features/settings/accessibility.vue'
    import Shopping from '../../components/features/settings/devices.vue'

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