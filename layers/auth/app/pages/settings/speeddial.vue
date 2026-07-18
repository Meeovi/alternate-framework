<template>
    <div>
        <v-toolbar flat color="white">
            <v-toolbar-title>Speed Dial</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn color="primary" variant="flat" to="/settings/dial/new">
                Add New
            </v-btn>
        </v-toolbar>

        <div v-for="dials in dials" :key="dials.id">
            <v-card class="mx-auto" max-width="400" :href="`/settings/dial/${dials?.id}`">
                <v-img class="align-end text-white" height="200"
                    :src="`${$directus.url}assets/${dials?.image?.filename_disk}`" cover>
                    <v-card-title>{{ dials?.name }}</v-card-title>
                </v-img>

                <v-card-subtitle class="pt-4">
                    {{ dials?.accountStatus }}
                </v-card-subtitle>

                <v-card-text>
                    <div>{{ dials?.ageStatus }}</div>
                </v-card-text>
            </v-card>
        </div>
    </div>
</template>

<script setup>
import { useHead } from 'nuxt/app';

    const {
        $directus,
        $readItem
    } = useNuxtApp()

    const {
        data: dials
    } = await useAsyncData('speeddial', () => {
        return $directus.request($readItem('speeddial'))
    })

    useHead({
        title: 'Speed Dial',
        meta: [
            { name: 'description', content: 'Manage your speed dial settings' }
        ]
    })
</script>