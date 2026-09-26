<template>
    <v-row justify="center">
        <v-dialog v-model="dialog" :scrim="false" transition="dialog-bottom-transition">
            <template v-slot:activator="{ props }">
                <v-btn v-bind="props" :title="eco?.description" class="ecoBtn">
                    <v-icon start icon="fas:fa fa-grip"></v-icon>
                </v-btn>
            </template>
            <v-card>
                <v-toolbar dark color="primary">
                    <v-btn icon dark @click="dialog = false">
                        <v-icon icon="fas:fa fa-circle-xmark"></v-icon>
                    </v-btn>
                    <v-card-title>
                        <span class="text-h6">{{ eco?.name }}</span>
                    </v-card-title>
                </v-toolbar>
                <v-row style="padding: 10px;">
                    <v-col v-for="menu in activeMenus" :key="menu.id" cols="3">
                        <NuxtLink :to="menu.slug">
                            <v-card class="mx-auto" max-width="300">
                                <div class="ecoAvatar">
                                    <v-avatar :icon="`fas:fa fa-${menu.icon}`" size="180"></v-avatar>
                                </div>
                                <v-card-title class="ecoTitle">{{ menu.name }}</v-card-title>
                            </v-card>
                        </NuxtLink>
                    </v-col>
                </v-row>
            </v-card>
        </v-dialog>
    </v-row>
</template>

<script setup>
    import {
        ref
    } from 'vue'
    import {
        createDirectus,
        rest,
        readItem
    } from '@directus/sdk';

    const config = useRuntimeConfig()
    const dialog = ref(false);
    const client = createDirectus(`${config.public.meeDirectusUrl}`).with(rest());

    const {
        data: eco
    } = useLazyAsyncData('eco', () => {
        return client.request(readItem('navigation', '12'))
    })

    const activeMenus = computed(() => eco.value?.menus?.filter(m => m?.active === 'Active') || [])
</script>