<template>
    <div>
        <v-toolbar>
            <v-toolbar-title>Language & Currency Settings</v-toolbar-title>
        </v-toolbar>

        <v-divider></v-divider>

        <v-card class="langCard" elevation="0">
            <p v-html="langPage?.content"></p>

            <LangSwitcher class="langCardSwitcher" />
        </v-card>

        <br>

        <v-divider></v-divider>

        <br>
        <currencyPageWidget />
    </div>
</template>

<script setup>
    import {
        ref,
        computed
    } from '#imports'
    import LangSwitcher from '#shared/app/components/blocks/langSwitcher.vue'
    import currencyPageWidget from './currencyPage.vue'

    const {
        $directus,
        $readItem
    } = useNuxtApp()
    const tab = ref(null)

    const {
        data: langPage
    } = await useAsyncData('langPage', () => {
        return $directus.request($readItem('pages', '179', {
            fields: ['*', {
                '*': ['*']
            }]
        }))
    })

    const {
        data: currencyPage
    } = await useAsyncData('currencyPage', () => {
        return $directus.request($readItem('pages', '180', {
            fields: ['*', {
                '*': ['*']
            }]
        }))
    })

    useHead({
        title: 'Language & Currency Center'
    })
</script>