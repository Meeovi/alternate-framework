<template>
    <div class="contentPage">
        <v-toolbar style="background-color: powderblue;">
            <v-toolbar-title>{{ accountSocial?.name }}</v-toolbar-title>
        </v-toolbar>

        <v-divider></v-divider>

        <v-sheet>
            <v-row>
                <v-col cols="4" v-for="home in accountSocial?.repeaterTextBox" :key="home">
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
        data: accountSocial
    } = await useAsyncData('accountSocial', async () => {
        const resp = await $directus.request($readItem('pages', '184', {
            fields: ['*', {
                '*': ['*']
            }]
        }))
        return resp?.data ?? resp ?? null
    })

  useHead({
    title: () => accountSocial.value?.name || 'Page',
  })
</script>