<template>
    <v-card>
        <v-toolbar color="purple">
            <v-toolbar-title>Notifications Center</v-toolbar-title>

            <template v-slot:extension>
                <v-tabs v-model="tab" align-tabs="center">
                    <div v-for="(menu, index) in notifyBar?.menus" :key="index">
                        <v-tab :value="menu?.value">
                            <v-btn variant="text"
                                :style="`color: ${notifyBar?.colortext} !important`">{{ menu?.name }}</v-btn>
                        </v-tab>
                    </div>
                </v-tabs>
            </template>
        </v-toolbar>

        <v-tabs-window v-model="tab">
            <v-tabs-window-item :value="notifyBar?.menus?.[0]?.value">
                <v-card>
                    <v-card-text>{{ text }}</v-card-text>
                </v-card>
            </v-tabs-window-item>
        </v-tabs-window>
    </v-card>
</template>

<script setup>
    import {
        ref
    } from 'vue'

    const { $sdk } = useNuxtApp()
    const tab = ref(null);

    const {
        data: notifyBar
    } = await useAsyncData('notifyBar', async () => {
        const resp = await $sdk.content.getItem('navigation', '93', {
            fields: ['*', {
                '*': ['*']
            }]
        })
        return resp?.data ?? resp ?? null
    })

    const {
        data: notifyPage
    } = await useAsyncData('notifyPage', async () => {
        const resp = await $sdk.content.getItem('pages', '95', {
            fields: ['*', {
                '*': ['*']
            }]
        })
        return resp?.data ?? resp ?? null
    })

    useHead({
        title: computed(() => notifyPage.value?.name || 'Notifications Center')
    })

    definePageMeta({
        //middleware: ['authenticated']
    })
</script>