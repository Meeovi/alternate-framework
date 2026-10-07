<template>
    <v-row justify="center">
        <v-dialog v-model="dialog" :scrim="false" transition="dialog-bottom-transition">
            <template v-slot:activator="{ props }">
                <v-btn v-bind="props" :title="eco?.description">
                    <v-icon start icon="fas fa-grip"></v-icon>
                </v-btn>
            </template>
            <v-card>
                <v-toolbar dark color="primary">
                    <v-btn icon dark @click="dialog = false">
                        <v-icon icon="fas fa-circle-xmark"></v-icon>
                    </v-btn>
                    <v-card-title>
                        <span class="text-h6">{{ eco?.name }}</span>
                    </v-card-title>
                </v-toolbar>
                <v-row style="padding: 10px;">
                    <v-col cols="3" v-for="menu in activeMenus" :key="menu?.id">
                        <v-card
    append-icon="fas fa-arrow-up-right-from-square"
    class="mx-auto"
    :href="toPath(menu?.slug)"
    max-width="344"
    :prepend-icon="`fas fa-${menu?.icon}`"
    rel="noopener"
    :subtitle="menu?.subtitle"
    target="_blank"
    :title="menu?.name"
  ></v-card>
                    </v-col>
                </v-row>
            </v-card>
        </v-dialog>
    </v-row>
</template>

<script setup>
    import { useRoutePath } from '#shared/app/composables/routing/useRoutePath'
    import {
        ref,
        computed,
    } from 'vue'
    const { normalizeRoutePath } = useRoutePath()

    const toPath = (slug) => normalizeRoutePath(slug)

    const {
        $directus,
        $readItem,
    } = useNuxtApp()

    const {
        data: eco
    } = await useAsyncData('eco', async () => {
        const resp = await $directus.request($readItem('navigation', '12'))
        return resp?.data || resp || {}
    })

    const dialog = ref(false);

const activeMenus = computed(() => {
    return eco.value?.menus?.filter(menu => menu.active === 'Active') || []
})
</script>