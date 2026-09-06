<template>
    <div class="contentPage">
        <v-toolbar color="#11389b">
            <v-toolbar-title>{{ accountHome?.name }}</v-toolbar-title>
        </v-toolbar>

        <v-sheet color="transparent" class="accountsHomePage">
            <v-row>
                <v-col cols="4" v-for="home in accountHome?.repeaterTextBox" :key="home">
                    <v-card :href="`${home?.url}`">
                        <v-card-title>{{ home?.name }}</v-card-title>
                        <v-card-text>
                            {{ home?.description }}
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
        </v-sheet>
    </div>
</template>

<script setup>
    import { ref } from '#imports'
    
    const tab = ref(null)

    const {
        $directus,
        $readItem
    } = useNuxtApp()

    const {
        data: accountHome
    } = await useAsyncData('accountHome', async () => {
        const resp = await $directus.request($readItem('pages', '182', {
            fields: ['*', {
                '*': ['*']
            }]
        }))
        return resp?.data ?? resp ?? null
    })
</script>