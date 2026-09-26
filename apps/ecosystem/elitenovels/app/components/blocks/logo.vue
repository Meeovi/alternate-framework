<template>
    <div>
        <v-app-bar-title>
            <NuxtLink class="logobrand" to="/">
                <v-icon start color="orange" v-if="blocksSiteoverview?.image?.length">
                    <img :src="`${$directus?.url}assets/${blocksSiteoverview?.image?.filename_disk}`"
                        :alt="blocksSiteoverview?.name" />
                </v-icon>
                <p class="logotext">{{ blocksSiteoverview?.name }}<!--Elite Novels--></p>
            </NuxtLink>
        </v-app-bar-title>
    </div>
</template>

<script setup>
    import {
        ref
    } from 'vue'

    const {
        $directus,
        $readItem
    } = useNuxtApp()

    const {
        data: blocksSiteoverview
    } = useLazyAsyncData('blocksSiteoverview', () => {
        return $directus.request($readItem('blocks', '2', {
            fields: ['*', {
                '*': ['*']
            }],
        }))
    })
</script>